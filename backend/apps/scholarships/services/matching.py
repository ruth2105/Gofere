"""Personalized scholarship eligibility matching.

This service separates confirmed eligibility from missing or unverified
information. It does not infer nationality or interpret free-text eligibility.
"""

from datetime import date

from django.db.models import Exists, OuterRef

from apps.opportunities.models import OpportunitySourceRecord

from ..models import Scholarship


ELIGIBLE = "ELIGIBLE"
NOT_ELIGIBLE = "NOT_ELIGIBLE"
NEEDS_VERIFICATION = "NEEDS_VERIFICATION"

DEGREE_ALIASES = {
    "HIGH_SCHOOL": "HIGH_SCHOOL",
    "HIGH SCHOOL": "HIGH_SCHOOL",
    "SECONDARY": "HIGH_SCHOOL",
    "UNDERGRADUATE": "UNDERGRADUATE",
    "UNDERGRADUATE DEGREE": "UNDERGRADUATE",
    "BACHELOR": "UNDERGRADUATE",
    "BACHELORS": "UNDERGRADUATE",
    "BACHELOR'S": "UNDERGRADUATE",
    "GRADUATE": "GRADUATE",
    "POSTGRADUATE": "POSTGRADUATE",
    "POSTGRADUATE DEGREE": "POSTGRADUATE",
    "POSTGRADUATE DIPLOMA": "POSTGRADUATE",
    "MASTER": "POSTGRADUATE",
    "MASTERS": "POSTGRADUATE",
    "MASTER'S": "POSTGRADUATE",
    "DOCTORATE": "DOCTORATE",
    "PHD": "DOCTORATE",
    "PH.D.": "DOCTORATE",
}


def get_public_scholarships():
    """Return published scholarships whose linked sources remain verified."""

    invalid_source_records = OpportunitySourceRecord.objects.filter(
        scholarship_id=OuterRef("pk"),
    ).exclude(
        verification_status="VERIFIED",
        source_status="AVAILABLE",
        verified_at__isnull=False,
        verified_by__role__in=("ADMIN", "SUPERADMIN"),
        source__is_active=True,
    )
    return Scholarship.objects.filter(is_published=True).filter(
        ~Exists(invalid_source_records)
    )


def get_current_scholarships():
    """Return current open public scholarships with unexpired deadlines."""

    return get_public_scholarships().filter(
        status="OPEN",
        application_deadline__gte=date.today(),
    )


def _normalize_degree(value):
    if not isinstance(value, str):
        return None
    return DEGREE_ALIASES.get(value.strip().upper())


def _normalize_field(value):
    if not isinstance(value, str) or not value.strip():
        return None
    return value.strip().casefold()


def _normalize_country_codes(value):
    if not isinstance(value, list):
        return [], True

    codes = []
    has_invalid_code = False
    for code in value:
        if (
            not isinstance(code, str)
            or len(code.strip()) != 2
            or not code.strip().isalpha()
        ):
            has_invalid_code = True
        else:
            codes.append(code.strip().upper())
    return codes, has_invalid_code


def evaluate_scholarship(profile, scholarship):
    """Evaluate only structured scholarship requirements and confirmed profile data."""

    reasons = []
    needs_verification = []
    is_not_eligible = False

    nationality = getattr(profile, "nationality_country", None)
    nationality_code = None
    if nationality is not None and nationality.is_active:
        nationality_code = nationality.code.upper()

    excluded_countries, invalid_exclusions = _normalize_country_codes(
        scholarship.excluded_countries or []
    )
    if invalid_exclusions:
        needs_verification.append("excluded_countries")
    if nationality_code and nationality_code in excluded_countries:
        is_not_eligible = True
        reasons.append("Your nationality is explicitly excluded.")

    nationality_eligibility = scholarship.nationality_eligibility
    target_countries, invalid_targets = _normalize_country_codes(
        scholarship.target_countries or []
    )
    if invalid_targets:
        needs_verification.append("target_countries")
    if nationality_eligibility == "NOT_CONFIRMED":
        needs_verification.append("nationality_eligibility")
    elif nationality_eligibility == "SPECIFIC":
        if not target_countries:
            needs_verification.append("target_countries")
        elif nationality_code is None:
            needs_verification.append("nationality")
        elif nationality_code not in target_countries:
            is_not_eligible = True
            reasons.append("Your nationality is not in the eligible country list.")
    elif nationality_eligibility == "ALL":
        if excluded_countries and nationality_code is None:
            needs_verification.append("nationality")
    else:
        needs_verification.append("nationality_eligibility")

    if scholarship.level != "ALL":
        target_degree = _normalize_degree(profile.target_degree_level)
        if target_degree is None:
            needs_verification.append("target_degree_level")
        elif target_degree != scholarship.level:
            is_not_eligible = True
            reasons.append("Your selected degree level does not match.")

    if scholarship.required_gpa is not None:
        if profile.gpa is None:
            needs_verification.append("gpa")
        elif profile.gpa < scholarship.required_gpa:
            is_not_eligible = True
            reasons.append("Your GPA is below the scholarship requirement.")

    eligible_fields = scholarship.fields or []
    if not isinstance(eligible_fields, list):
        needs_verification.append("fields")
    elif eligible_fields:
        student_field = _normalize_field(profile.field_of_study)
        normalized_fields = [
            _normalize_field(field)
            for field in eligible_fields
            if isinstance(field, str) and field.strip()
        ]
        has_invalid_field = len(normalized_fields) != len(eligible_fields)
        if has_invalid_field:
            needs_verification.append("fields")
        if not normalized_fields:
            needs_verification.append("fields")
        elif student_field is None:
            needs_verification.append("field_of_study")
        elif student_field not in normalized_fields:
            is_not_eligible = True
            reasons.append("Your field of study is not in the eligible field list.")

    if is_not_eligible:
        status = NOT_ELIGIBLE
    elif needs_verification:
        status = NEEDS_VERIFICATION
    else:
        status = ELIGIBLE

    return {
        "status": status,
        "reasons": reasons,
        "needs_verification": list(dict.fromkeys(needs_verification)),
    }
