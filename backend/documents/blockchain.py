
import json
import os
from pathlib import Path

from dotenv import load_dotenv
from web3 import Web3

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

RPC_URL = os.getenv(
    "BLOCKCHAIN_RPC_URL",
    "http://127.0.0.1:8545",
)

CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")

PROJECT_ROOT = Path(__file__).resolve().parents[2]

ABI_PATH = (
    PROJECT_ROOT
    / "artifacts"
    / "contracts"
    / "DocumentRegistry.sol"
    / "DocumentRegistry.json"
)


def get_contract():
    if not CONTRACT_ADDRESS:
        raise RuntimeError("CONTRACT_ADDRESS is missing from backend/.env")

    if not Web3.is_address(CONTRACT_ADDRESS):
        raise RuntimeError("CONTRACT_ADDRESS is invalid")

    w3 = Web3(Web3.HTTPProvider(RPC_URL))

    if not w3.is_connected():
        raise RuntimeError(
            "Cannot connect to Hardhat. Is the local node running?"
        )

    if not ABI_PATH.exists():
        raise RuntimeError(
            f"Contract ABI not found at {ABI_PATH}"
        )

    with ABI_PATH.open("r", encoding="utf-8") as file:
        artifact = json.load(file)

    contract = w3.eth.contract(
        address=Web3.to_checksum_address(CONTRACT_ADDRESS),
        abi=artifact["abi"],
    )

    return w3, contract
