#This is the python CLI version that I created after the first C fafo

import argparse
import getpass
import base64
import hashlib
from cryptography.fernet import Fernet
import pyperclip

def scramble(key: bytes, func: str = 'md5') -> bytes:
    hash_func = getattr(hashlib, func)
    hashed_key = hash_func(key).digest()
    return hashed_key

def scramble(key: bytes, func: str = 'sha256') -> bytes:
    hash_func = getattr(hashlib, func)
    hashed_key = hash_func(key).digest()
    return hashed_key

def convert_to_charset(password: bytes, specialchars: str) -> str:
    return ''.join([chr(c) if chr(c).isalnum() else specialchars[i % len(specialchars)] for i, c in enumerate(password)])

def main():
    f_choices = sorted(list(hashlib.algorithms_guaranteed))
    parser = argparse.ArgumentParser(description="Bhurji: I like my passwords the way I like my eggs, scrambled")
    parser.add_argument('--scramble-func', dest="func", default='sha256', choices=f_choices, help="Hashing function to use for input data scrambling, default=sha256")
    parser.add_argument('--file', dest="file", required=True, help="File used to initialize generation")
    parser.add_argument('--login', dest="login", required=True, help="Login for which you want to use the password")
    parser.add_argument('--special', dest="special", default="_&#", help="Whitelist of special characters (e.g. '_&#'), default='_&#'")
    parser.add_argument('--length', dest="length", default=30, type=int, help="Length of the password, default=30")
    parser.add_argument('--loop', dest="loop", default=1, type=int, help="How many times the hashing function will be executed, default=1")
    parser.add_argument('--noclip', dest="clip", default=True, action="store_false", help="Display the generated password instead of copying to clipboard")
    args = parser.parse_args()

    try:
        with open(args.file, 'rb') as fd:
            raw = fd.read()
    except FileNotFoundError:
        print(f"[ERROR]: File {args.file} not found.")
        return

    password = getpass.getpass()
    key = password.encode("utf-8")
    vec = args.login.encode("utf-8")

    for _ in range(args.loop):
        key = scramble(key, args.func)
        vec = scramble(vec, args.func)

    aes_out1 = hashlib.sha256(raw + key).digest()

    sha_digest = hashlib.sha512(aes_out1).digest()
    key2 = sha_digest[:32]

    aes_out2 = hashlib.sha256(aes_out1 + key2).digest()

    start = key[0] % len(aes_out2)
    portion = aes_out2[start:]
    result = portion

    for _ in range(args.loop):
        result = hashlib.sha512(result).digest()

    longpass = base64.b64encode(result)
    longpass = longpass[0:args.length]
    longpass = convert_to_charset(longpass, sorted(args.special, reverse=True))

    print("---")
    if args.clip:
        pyperclip.copy(longpass)
        print("[INFO]: The generated password is in your clipboard.")
    else:
        print(longpass)
        print("---")

if __name__ == "__main__":
    main()