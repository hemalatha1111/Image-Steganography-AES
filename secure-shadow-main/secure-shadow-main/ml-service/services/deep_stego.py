import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np
from PIL import Image

class DeepSteganography:
    """
    Deep Learning based steganography using encoder-decoder architecture
    """
    def __init__(self):
        self.encoder = self._build_encoder()
        self.decoder = self._build_decoder()
        
        # Load pre-trained weights if available
        try:
            self.encoder.load_weights('models/encoder_weights.h5')
            self.decoder.load_weights('models/decoder_weights.h5')
        except:
            print("Warning: Pre-trained models not found. Using random initialization.")
    
    def _build_encoder(self):
        """
        Build encoder network that embeds secret into cover image
        """
        # Cover image input
        cover_input = layers.Input(shape=(None, None, 3), name='cover_image')
        
        # Secret data input (as image representation)
        secret_input = layers.Input(shape=(None, None, 3), name='secret_data')
        
        # Concatenate inputs
        x = layers.Concatenate()([cover_input, secret_input])
        
        # Encoder layers
        x = layers.Conv2D(64, 3, padding='same', activation='relu')(x)
        x = layers.Conv2D(64, 3, padding='same', activation='relu')(x)
        x = layers.Conv2D(64, 3, padding='same', activation='relu')(x)
        x = layers.Conv2D(64, 3, padding='same', activation='relu')(x)
        
        # Output stego image
        output = layers.Conv2D(3, 3, padding='same', activation='sigmoid')(x)
        
        model = keras.Model(inputs=[cover_input, secret_input], outputs=output, name='encoder')
        return model
    
    def _build_decoder(self):
        """
        Build decoder network that extracts secret from stego image
        """
        # Stego image input
        stego_input = layers.Input(shape=(None, None, 3), name='stego_image')
        
        # Decoder layers
        x = layers.Conv2D(64, 3, padding='same', activation='relu')(stego_input)
        x = layers.Conv2D(64, 3, padding='same', activation='relu')(x)
        x = layers.Conv2D(64, 3, padding='same', activation='relu')(x)
        x = layers.Conv2D(64, 3, padding='same', activation='relu')(x)
        
        # Output secret data
        output = layers.Conv2D(3, 3, padding='same', activation='sigmoid')(x)
        
        model = keras.Model(inputs=stego_input, outputs=output, name='decoder')
        return model
    
    def embed(self, image_file, data: str) -> Image.Image:
        """
        Embed data into image using deep learning
        """
        # Load cover image
        cover_image = Image.open(image_file).convert('RGB')
        cover_array = np.array(cover_image).astype(np.float32) / 255.0
        
        # Convert data to image representation
        secret_image = self._data_to_image(data, cover_array.shape[:2])
        
        # Prepare inputs
        cover_batch = np.expand_dims(cover_array, axis=0)
        secret_batch = np.expand_dims(secret_image, axis=0)
        
        # Generate stego image
        stego_batch = self.encoder.predict([cover_batch, secret_batch], verbose=0)
        
        # Convert back to PIL Image
        stego_array = (stego_batch[0] * 255).astype(np.uint8)
        stego_image = Image.fromarray(stego_array)
        
        return stego_image
    
    def extract(self, image_file) -> str:
        """
        Extract data from stego image using deep learning
        """
        # Load stego image
        stego_image = Image.open(image_file).convert('RGB')
        stego_array = np.array(stego_image).astype(np.float32) / 255.0
        
        # Prepare input
        stego_batch = np.expand_dims(stego_array, axis=0)
        
        # Extract secret
        secret_batch = self.decoder.predict(stego_batch, verbose=0)
        
        # Convert image representation back to data
        secret_image = secret_batch[0]
        data = self._image_to_data(secret_image)
        
        return data
    
    def _data_to_image(self, data: str, shape: tuple) -> np.ndarray:
        """
        Convert text data to image representation
        """
        # Convert to binary
        binary_data = ''.join(format(ord(c), '08b') for c in data)
        
        # Pad to fill image
        total_pixels = shape[0] * shape[1] * 3
        binary_data = binary_data[:total_pixels].ljust(total_pixels, '0')
        
        # Convert to array
        data_array = np.array([int(b) for b in binary_data], dtype=np.float32)
        data_array = data_array.reshape(shape[0], shape[1], 3)
        
        return data_array
    
    def _image_to_data(self, image: np.ndarray) -> str:
        """
        Convert image representation back to text data
        """
        # Flatten and convert to binary
        flat = image.flatten()
        binary_data = ''.join(['1' if x > 0.5 else '0' for x in flat])
        
        # Convert binary to text
        chars = []
        for i in range(0, len(binary_data), 8):
            byte = binary_data[i:i+8]
            char_code = int(byte, 2)
            if char_code == 0:
                break
            if 32 <= char_code <= 126:  # Printable ASCII
                chars.append(chr(char_code))
        
        return ''.join(chars)
    
    def train(self, cover_images, secret_images, epochs=50, batch_size=8):
        """
        Train the encoder-decoder model
        """
        # Compile models
        self.encoder.compile(
            optimizer='adam',
            loss='mse',
            metrics=['mae']
        )
        
        self.decoder.compile(
            optimizer='adam',
            loss='mse',
            metrics=['mae']
        )
        
        # Training loop
        for epoch in range(epochs):
            # Train encoder
            stego_images = self.encoder.fit(
                [cover_images, secret_images],
                cover_images,  # Stego should look like cover
                batch_size=batch_size,
                epochs=1,
                verbose=0
            )
            
            # Train decoder
            self.decoder.fit(
                stego_images,
                secret_images,  # Should extract secret
                batch_size=batch_size,
                epochs=1,
                verbose=0
            )
            
            print(f"Epoch {epoch+1}/{epochs} completed")
        
        # Save weights
        self.encoder.save_weights('models/encoder_weights.h5')
        self.decoder.save_weights('models/decoder_weights.h5')
