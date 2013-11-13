from django.conf import settings
from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
from filedrop import views

admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'filedrop.views.home', name='home'),
    # url(r'^filedrop/', include('filedrop.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),

    url(r'^demo/$', views.test_page, name='test_page'),

    url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT}),

    url(r'^demo/uploadfile/$', views.upload_file, name='upload_file'),
)
