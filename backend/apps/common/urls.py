from rest_framework.routers import DefaultRouter

from .views import CountryViewSet

app_name = 'common'

router = DefaultRouter()
router.register('', CountryViewSet, basename='country')

urlpatterns = router.urls
