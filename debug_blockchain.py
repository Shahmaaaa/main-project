import os
import json
from web3 import Web3
from dotenv import load_dotenv

load_dotenv('.env')

RPC_URL = os.getenv("RPC_URL", "http://127.0.0.1:7545")
print(f"Connecting to {RPC_URL}...")

w3 = Web3(Web3.HTTPProvider(RPC_URL))

if w3.is_connected():
    print("Connected to Blockchain")
    print(f"Chain ID: {w3.eth.chain_id}")
    print(f"Block Number: {w3.eth.block_number}")
    print(f"Accounts: {w3.eth.accounts}")
    
    contract_addr = os.getenv("CONTRACT_ADDRESS")
    if contract_addr:
        code = w3.eth.get_code(w3.to_checksum_address(contract_addr))
        if code == b'\x00' or code == b'':
            print(f"WARNING: No contract code found at {contract_addr} on this network.")
        else:
            print(f"SUCCESS: Contract found at {contract_addr}")
else:
    print("FAILED to connect to Blockchain.")
