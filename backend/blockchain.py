import os
import json
from web3 import Web3

# Connect to Ganache
GANACHE_URL = "http://127.0.0.1:7545"
w3 = Web3(Web3.HTTPProvider(GANACHE_URL))

contract = None
admin_account = None

def load_contract():
    global contract, admin_account
    
    if not w3.is_connected():
        print("[ERROR] Failed to connect to Blockchain at", GANACHE_URL)
        return None

    # Load Truffle Artifact
    # Assumes backend/ is current dir, so build/ is at ../build
    # Adjust path if running from root
    basedir = os.path.dirname(os.path.abspath(__file__))
    artifact_path = os.path.join(basedir, "..", "build", "contracts", "BlockAid.json")
    
    if not os.path.exists(artifact_path):
        print(f"[WARN] Contract artifact not found at {artifact_path}. Run 'truffle migrate' first.")
        return None

    with open(artifact_path) as f:
        artifact = json.load(f)

    # Get Network ID
    network_id = str(w3.eth.chain_id)
    # Ganache default often 5777, but w3.eth.chain_id should match
    # Truffle stores networks by ID.
    
    if network_id not in artifact["networks"]:
        # Try to find any network if specific one not found (dev env)
        if artifact["networks"]:
            network_id = list(artifact["networks"].keys())[-1]
        else:
            print("[WARN] Contract not deployed on current network.")
            return None

    address = artifact["networks"][network_id]["address"]
    abi = artifact["abi"]

    contract = w3.eth.contract(address=address, abi=abi)
    
    # Set Admin (First account from Ganache)
    if w3.eth.accounts:
        admin_account = w3.eth.accounts[0]
        
    print(f"[SUCCESS] Contract loaded at {address}")
    return contract

# Load immediately
load_contract()

def create_on_chain(report_id, recipient_address):
    """
    Records the first-time report creation on blockchain.
    """
    if not contract or not admin_account:
        print("Blockchain not initialized.")
        return None

    try:
        # We use a placeholder hash for the demo
        data_hash = f"DATA_{report_id}"
        
        tx_hash = contract.functions.createReport(
            report_id, 
            data_hash,
            w3.to_checksum_address(recipient_address)
        ).transact({'from': admin_account})
        
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        print(f"[BLOCKCHAIN] Report {report_id} created on-chain for {recipient_address}")
        return receipt.transactionHash.hex()
        
    except Exception as e:
        print(f"[ERROR] Blockchain create error: {e}")
        return None

def approve_on_chain(report_id, severity, amount_eth=0):
    """
    Records approval on blockchain.
    """
    if not contract or not admin_account:
        print("Blockchain not initialized.")
        return None

    try:
        # Amount in Wei
        amount_wei = w3.to_wei(amount_eth, 'ether')

        tx_hash = contract.functions.approveReport(
            report_id, 
            severity, 
            amount_wei
        ).transact({'from': admin_account})
        
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        print(f"[BLOCKCHAIN] Transaction confirmed in block {receipt.blockNumber}")
        return receipt.transactionHash.hex()
        
    except Exception as e:
        print(f"[ERROR] Blockchain error: {e}")
        return None
