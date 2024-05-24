//This was the playing around that lead to bhurji as a who;e
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <openssl/aes.h>
#include <openssl/evp.h>
#include <openssl/sha.h>
#include <openssl/rand.h>

#define BLOCK_SIZE 16
#define KEY_SIZE 32

void handleErrors(void)
{
    ERR_print_errors_fp(stderr);
    abort();
}

int encrypt(unsigned char *plaintext, int plaintext_len, unsigned char *key,
            unsigned char *iv, unsigned char *ciphertext)
{
    EVP_CIPHER_CTX *ctx;
    int len;
    int ciphertext_len;

    if(!(ctx = EVP_CIPHER_CTX_new())) handleErrors();

    if(1 != EVP_EncryptInit_ex(ctx, EVP_aes_256_cbc(), NULL, key, iv))
        handleErrors();

    if(1 != EVP_EncryptUpdate(ctx, ciphertext, &len, plaintext, plaintext_len))
        handleErrors();
    ciphertext_len = len;

    if(1 != EVP_EncryptFinal_ex(ctx, ciphertext + len, &len)) handleErrors();
    ciphertext_len += len;

    EVP_CIPHER_CTX_free(ctx);

    return ciphertext_len;
}

int main(int argc, char *argv[]) {
    unsigned char key[KEY_SIZE];
    unsigned char iv[BLOCK_SIZE];
    unsigned char ciphertext[128];

    if (RAND_bytes(key, sizeof key) != 1) {
        // handle error
    }

    if (RAND_bytes(iv, sizeof iv) != 1) {
        // handle error
    }

    char plaintext[] = "Hello, World!";
    int ciphertext_len = encrypt(plaintext, strlen(plaintext), key, iv, ciphertext);

    // Print the encrypted text
    for(int i = 0; i < ciphertext_len; i++) {
        printf("%02x", ciphertext[i]);
    }

    return 0;
}