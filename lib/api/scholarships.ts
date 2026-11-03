import { Scholarship } from '@/types';
import { api, PaginatedResponse, ScholarshipApiRecord } from './client';

const scholarshipTypeLabels: Record<string, Scholarship['type']> = {
  FULL: 'Full',
  PARTIAL: 'Partial',
  MERIT: 'Merit-Based',
  NEED: 'Need-Based',
  RESEARCH: 'Merit-Based',
  ATHLETIC: 'Merit-Based',
};

const scholarshipLevelLabels: Record<string, Scholarship['level']> = {
  UNDERGRADUATE: 'Undergraduate',
  GRADUATE: 'Graduate',
  POSTGRADUATE: 'Postgraduate',
  DOCTORATE: 'PhD',
  ALL: 'All Levels',
};

export function mapScholarship(record: ScholarshipApiRecord): Scholarship {
  const type = scholarshipTypeLabels[record.type];
  if (!type) throw new Error(`Unsupported scholarship type: ${record.type}`);

  const level = scholarshipLevelLabels[record.level];
  if (!level) throw new Error(`Unsupported scholarship level: ${record.level}`);

  return {
    id: record.slug,
    title: record.name,
    provider: record.provider,
    country: record.country,
    amount: record.amount_type || record.amount,
    type,
    eligibility: record.eligibility ?? [],
    deadline: record.application_deadline,
    description: record.description || record.short_description,
    level,
    fields: record.fields ?? [],
    applicationLink: record.application_url || record.website_url || '',
    featured: record.is_featured,
  };
}

export async function getScholarships(): Promise<Scholarship[]> {
  const records: ScholarshipApiRecord[] = [];
  let page = 1;
  let response: PaginatedResponse<ScholarshipApiRecord>;

  do {
    response = await api.scholarships.list({ page });
    records.push(...response.results);
    page += 1;
  } while (response.next);

  return records.map(mapScholarship);
}

export async function getScholarship(slug: string): Promise<Scholarship> {
  const record = await api.scholarships.get(slug);
  return mapScholarship(record);
}
