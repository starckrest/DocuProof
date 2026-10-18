
from django.urls import path

from . import views

urlpatterns = [
    path(
        "register/",
        views.register_document,
        name="register-document",
    ),
    path(
        "verify/",
        views.verify_document,
        name="verify-document",
    ),
    path(
        "<str:document_hash>/",
        views.get_document,
        name="get-document",
    ),
]
