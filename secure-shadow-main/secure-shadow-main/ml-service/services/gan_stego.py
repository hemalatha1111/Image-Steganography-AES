import torch
import torch.nn as nn
import numpy as np
from PIL import Image
import io

class Generator(nn.Module):
    """
    Generator network for GAN-based steganography
    Embeds secret data into cover image
    """
    def __init__(self):
        super(Generator, self).__init__()
        
        # Encoder for secret data
        self.secret_encoder = nn.Sequential(
            nn.Linear(256, 512),
            nn.ReLU(),
            nn.Linear(512, 1024),
            nn.ReLU(),
            nn.Linear(1024, 2048),
            nn.ReLU()
        )
        
        # Image encoder
        self.image_encoder = nn.Sequential(
            nn.Conv2d(3, 64, 3, padding=1),
            nn.ReLU(),
            nn.Conv2d(64, 128, 3, padding=1),
            nn.ReLU(),
            nn.Conv2d(128, 256, 3, padding=1),
            nn.ReLU()
        )
        
        # Fusion layer
        self.fusion = nn.Sequential(
            nn.Conv2d(256, 256, 3, padding=1),
            nn.ReLU(),
            nn.Conv2d(256, 128, 3, padding=1),
            nn.ReLU(),
            nn.Conv2d(128, 64, 3, padding=1),
            nn.ReLU(),
            nn.Conv2d(64, 3, 3, padding=1),
            nn.Tanh()
        )
    
    def forward(self, cover_image, secret_data):
        # Encode secret
        secret_encoded = self.secret_encoder(secret_data)
        
        # Encode image
        image_encoded = self.image_encoder(cover_image)
        
        # Reshape secret to match image dimensions
        batch_size, channels, height, width = image_encoded.shape
        secret_reshaped = secret_encoded.view(batch_size, -1, 1, 1)
        secret_reshaped = secret_reshaped.expand(-1, -1, height, width)
        
        # Combine
        combined = image_encoded + secret_reshaped[:, :channels, :, :]
        
        # Generate stego image
        stego_image = self.fusion(combined)
        
        return stego_image

class Extractor(nn.Module):
    """
    Extractor network for GAN-based steganography
    Extracts secret data from stego image
    """
    def __init__(self):
        super(Extractor, self).__init__()
        
        self.encoder = nn.Sequential(
            nn.Conv2d(3, 64, 3, padding=1),
            nn.ReLU(),
            nn.Conv2d(64, 128, 3, padding=1),
            nn.ReLU(),
            nn.Conv2d(128, 256, 3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d((1, 1))
        )
        
        self.decoder = nn.Sequential(
            nn.Linear(256, 1024),
            nn.ReLU(),
            nn.Linear(1024, 512),
            nn.ReLU(),
            nn.Linear(512, 256),
            nn.Sigmoid()
        )
    
    def forward(self, stego_image):
        features = self.encoder(stego_image)
        features = features.view(features.size(0), -1)
        secret_data = self.decoder(features)
        return secret_data

class GANSteganography:
    """
    GAN-based steganography implementation
    """
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.generator = Generator().to(self.device)
        self.extractor = Extractor().to(self.device)
        
        # Load pre-trained weights if available
        try:
            self.generator.load_state_dict(torch.load('models/generator.pth', map_location=self.device))
            self.extractor.load_state_dict(torch.load('models/extractor.pth', map_location=self.device))
        except:
            print("Warning: Pre-trained models not found. Using random initialization.")
        
        self.generator.eval()
        self.extractor.eval()
    
    def embed(self, image_file, data: str) -> Image.Image:
        """
        Embed data into image using GAN
        """
        # Load image
        image = Image.open(image_file).convert('RGB')
        image_array = np.array(image).astype(np.float32) / 255.0
        image_tensor = torch.from_numpy(image_array).permute(2, 0, 1).unsqueeze(0).to(self.device)
        
        # Convert data to binary and pad to 256 bits
        binary_data = ''.join(format(ord(c), '08b') for c in data)
        binary_data = binary_data[:256].ljust(256, '0')
        data_array = np.array([int(b) for b in binary_data], dtype=np.float32)
        data_tensor = torch.from_numpy(data_array).unsqueeze(0).to(self.device)
        
        # Generate stego image
        with torch.no_grad():
            stego_tensor = self.generator(image_tensor, data_tensor)
        
        # Convert back to image
        stego_array = stego_tensor.squeeze(0).permute(1, 2, 0).cpu().numpy()
        stego_array = ((stego_array + 1) * 127.5).clip(0, 255).astype(np.uint8)
        stego_image = Image.fromarray(stego_array)
        
        return stego_image
    
    def extract(self, image_file) -> str:
        """
        Extract data from stego image using GAN
        """
        # Load image
        image = Image.open(image_file).convert('RGB')
        image_array = np.array(image).astype(np.float32) / 255.0
        image_tensor = torch.from_numpy(image_array).permute(2, 0, 1).unsqueeze(0).to(self.device)
        
        # Extract secret data
        with torch.no_grad():
            data_tensor = self.extractor(image_tensor)
        
        # Convert to binary string
        data_array = data_tensor.squeeze(0).cpu().numpy()
        binary_data = ''.join(['1' if x > 0.5 else '0' for x in data_array])
        
        # Convert binary to text
        chars = []
        for i in range(0, len(binary_data), 8):
            byte = binary_data[i:i+8]
            if byte == '00000000':
                break
            chars.append(chr(int(byte, 2)))
        
        return ''.join(chars)
    
    def train(self, cover_images, secret_data, epochs=100):
        """
        Train the GAN model (for future use)
        """
        # Training implementation would go here
        # This is a placeholder for the training pipeline
        pass
