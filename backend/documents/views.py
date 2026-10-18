
import hashlib
import re

from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from .blockchain import get_contract


MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def hash_file(uploaded_file):
    """Return the SHA-256 digest of an uploaded file."""
    digest = hashlib.sha256()
    total_size = 0

    for chunk in uploaded_file.chunks():
        total_size += len(chunk)

        if total_size > MAX_FILE_SIZE:
            raise ValueError("File exceeds the 10 MB limit.")

        digest.update(chunk)

    return digest.digest()


def get_uploaded_hash(request):
    uploaded_file = request.FILES.get("file")

    if uploaded_file is None:
        raise ValueError("Upload a file using the 'file' field.")

    if uploaded_file.size > MAX_FILE_SIZE:
        raise ValueError("File exceeds the 10 MB limit.")

    return hash_file(uploaded_file)


def hash_to_hex(digest):
    return "0x" + digest.hex()


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def register_document(request):
    try:
        digest = get_uploaded_hash(request)
        document_hash = hash_to_hex(digest)

        w3, contract = get_contract()

        # Local development only: use a node-unlocked Hardhat account.
        account = w3.eth.accounts[0]

        tx_hash = contract.functions.registerDocument(
            digest
        ).transact({"from": account})

        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        if receipt["status"] != 1:
            return Response(
                {"error": "Blockchain transaction failed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "Document registered successfully.",
                "document_hash": document_hash,
                "owner": account,
                "transaction_hash": tx_hash.hex(),
                "block_number": receipt["blockNumber"],
            },
            status=status.HTTP_201_CREATED,
        )

    except ValueError as exc:
        return Response(
            {"error": str(exc)},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception as exc:
        return Response(
            {"error": str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def verify_document(request):
    try:
        digest = get_uploaded_hash(request)
        document_hash = hash_to_hex(digest)

        _, contract = get_contract()

        is_registered, owner, registered_at = (
            contract.functions.verifyDocument(digest).call()
        )

        return Response(
            {
                "document_hash": document_hash,
                "is_registered": is_registered,
                "owner": owner,
                "registered_at": registered_at,
                "authentic": is_registered,
                "message": (
                    "This exact file hash is registered."
                    if is_registered
                    else "No matching document hash was found."
                ),
            },
            status=status.HTTP_200_OK,
        )

    except ValueError as exc:
        return Response(
            {"error": str(exc)},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception as exc:
        return Response(
            {"error": str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
def get_document(request, document_hash):
    if not re.fullmatch(r"[0-9a-fA-F]{64}", document_hash):
        return Response(
            {"error": "Provide a valid 64-character SHA-256 hash."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        digest = bytes.fromhex(document_hash)
        _, contract = get_contract()

        is_registered, owner, registered_at = (
            contract.functions.verifyDocument(digest).call()
        )

        return Response(
            {
                "document_hash": hash_to_hex(digest),
                "is_registered": is_registered,
                "owner": owner,
                "registered_at": registered_at,
            },
            status=status.HTTP_200_OK,
        )

    except Exception as exc:
        return Response(
            {"error": str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
