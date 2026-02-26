import os
import json
from web3 import Web3
from dotenv import load_dotenv

# Load environment variables
basedir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(basedir, "../.env"))

# Connect to Ganache
GANACHE_URL = os.getenv("RPC_URL", "http://127.0.0.1:8545")
w3 = Web3(Web3.HTTPProvider(GANACHE_URL))

contract = None
admin_account = None

def load_contract():
    global contract, admin_account
    
    is_connected = w3.is_connected()
    if not is_connected:
        print(f"[WARN] Could not connect to Blockchain at {GANACHE_URL}. Check if Ganache is running.")

    # 1. TRY LOADING FROM ENV FIRST (MOST RELIABLE)
    env_address = os.getenv("CONTRACT_ADDRESS")
    
    # Load Truffle Artifact for ABI
    artifact_path = os.path.join(basedir, "..", "build", "contracts", "BlockAid.json")
    
    if not os.path.exists(artifact_path):
        print(f"[ERROR] Contract artifact not found at {artifact_path}.")
        return None

    try:
        with open(artifact_path) as f:
            artifact = json.load(f)

        abi = artifact["abi"]
        address = None

        if env_address and len(env_address) > 20:
            address = env_address
            print(f"[INFO] Using contract address from .env: {address}")
        else:
            # Fallback to Truffle Artifact
            network_id = str(w3.eth.chain_id) if is_connected else None
            if network_id and network_id in artifact.get("networks", {}):
                address = artifact["networks"][network_id]["address"]
            elif artifact.get("networks"):
                # Use the last deployed network
                last_network = list(artifact["networks"].keys())[-1]
                address = artifact["networks"][last_network]["address"]
            
        if not address:
            print("[ERROR] No contract address found in .env or artifacts.")
            return None

        # Initialize Contract
        contract = w3.eth.contract(address=w3.to_checksum_address(address), abi=abi)
        
        # Set Admin (From .env private key or Ganache first account)
        env_priv_key = os.getenv("PRIVATE_KEY")
        if env_priv_key:
            from eth_account import Account
            admin_account = Account.from_key(env_priv_key).address
            print(f"[INFO] Admin account set from Private Key: {admin_account}")
        elif is_connected and w3.eth.accounts:
            admin_account = w3.eth.accounts[0]
            print(f"[INFO] Admin account set from Ganache: {admin_account}")
            
        print(f"[SUCCESS] Blockchain service initialized. Contract: {address}")
        
        # Display Balance
        if admin_account and is_connected:
            balance_wei = w3.eth.get_balance(admin_account)
            balance_eth = w3.from_wei(balance_wei, 'ether')
            print(f"[WALLET] Admin Address: {admin_account}")
            print(f"[WALLET] Admin Balance: {balance_eth} ETH")

        return contract
    except Exception as e:
        print(f"[ERROR] Failed to load contract: {e}")
        import traceback
        traceback.print_exc()
        return None

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
