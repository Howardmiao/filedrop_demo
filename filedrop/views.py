import uuid
from django.conf import settings
from django.core.files import File
from django.core.files.storage import DefaultStorage
from django.core.files.temp import NamedTemporaryFile
from django.db import models
from django.http import HttpResponse
from django.template.response import TemplateResponse
from django.views.decorators.csrf import csrf_exempt
import simplejson


def test_page(request):
    return TemplateResponse(request, 'test_page.html')

def get_file_path(filename):
    ext = filename.split('.')[-1]
    filename = "%s.%s" % (uuid.uuid4(), ext)
    # return os.path.join('packing_slip', filename)
    return "temp/%s" % filename

@csrf_exempt
def upload_file(request):
    callback = request.POST.get("fd-callback", None)
    if len(request.FILES):
        file = request.FILES.get("fd-file")
        file_name = file.name
    else:
        file_name = request.META.get("HTTP_X_FILE_NAME")
        file_temp = NamedTemporaryFile()
        file = File(file_temp)
        chunk = request.read(1024)
        while chunk:
            file_temp.write(chunk)

            chunk = request.read(1024)
        file_temp.flush()

    default_storage = DefaultStorage()
    file_path = get_file_path(file_name)
    file_url = "%s%s" % (settings.MEDIA_URL, file_path)
    default_storage.save(file_path, file)
    output = simplejson.dumps({'success': True, 'file': file_url})
    if callback:
        html = '<!DOCTYPE html><html><head></head><body><script type="text/javascript">try{window.top.'+callback+'('+output+')}catch(e){}</script></body></html>'
        return HttpResponse(html)
    else:
        return HttpResponse(output, content_type='application/json; charset="utf-8"')