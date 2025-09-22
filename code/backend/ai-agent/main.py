import base64
import time
import sys

if __name__ == "__main__":
    print("Starting Farming Agent...")
    
    try:
        # Keep the script running
        while True:
            time.sleep(60)
    except (KeyboardInterrupt, SystemExit):
        print("\nShutting down...")
        scheduler.shutdown()
