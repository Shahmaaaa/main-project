"""
AI-based Disaster Severity Assessment Model
Trains EfficientNet-B0 for disaster image classification
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DisasterSeverityModel:
    """
    AI Model for disaster severity assessment using EfficientNet-B0
    """
    
    def __init__(self, img_height=224, img_width=224, num_classes=3):
        self.img_height = img_height
        self.img_width = img_width
        self.num_classes = num_classes
        self.class_labels = ['Low', 'Medium', 'High']
        self.model = None
        self.history = None
        
    def build_model(self):
        """Build EfficientNet-B0 model with transfer learning"""
        logger.info("Building EfficientNet-B0 model...")
        
        # Load pre-trained EfficientNet-B0
        base_model = EfficientNetB0(
            input_shape=(self.img_height, self.img_width, 3),
            include_top=False,
            weights='imagenet'
        )
        
        # Freeze base model weights
        base_model.trainable = False
        
        # Add custom layers
        model = models.Sequential([
            layers.Input(shape=(self.img_height, self.img_width, 3)),
            layers.Rescaling(1./255),
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.Dense(256, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            layers.Dense(128, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            layers.Dense(self.num_classes, activation='softmax')
        ])
        
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=1e-3),
            loss='categorical_crossentropy',
            metrics=['accuracy', keras.metrics.Precision(), keras.metrics.Recall()]
        )
        
        self.model = model
        logger.info("Model built successfully")
        return model
    
    def get_data_generators(self, data_dir, batch_size=32):
        """Create data generators for training and validation"""
        logger.info("Creating data generators...")
        
        # Training data augmentation
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            rotation_range=20,
            width_shift_range=0.2,
            height_shift_range=0.2,
            shear_range=0.2,
            zoom_range=0.2,
            horizontal_flip=True,
            fill_mode='nearest',
            validation_split=0.2
        )
        
        # Load training images
        train_generator = train_datagen.flow_from_directory(
            data_dir,
            target_size=(self.img_height, self.img_width),
            batch_size=batch_size,
            class_mode='categorical',
            subset='training'
        )
        
        val_generator = train_datagen.flow_from_directory(
            data_dir,
            target_size=(self.img_height, self.img_width),
            batch_size=batch_size,
            class_mode='categorical',
            subset='validation'
        )
        
        return train_generator, val_generator
    
    def train(self, train_generator, val_generator, epochs=25):
        """Train the model"""
        logger.info(f"Training model for {epochs} epochs...")
        
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=5,
                restore_best_weights=True
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=3,
                min_lr=1e-7
            ),
            keras.callbacks.ModelCheckpoint(
                'best_model.h5',
                monitor='val_accuracy',
                save_best_only=True
            )
        ]
        
        self.history = self.model.fit(
            train_generator,
            validation_data=val_generator,
            epochs=epochs,
            callbacks=callbacks
        )
        
        logger.info("Training completed")
        return self.history
    
    def evaluate(self, test_generator):
        """Evaluate model on test data"""
        logger.info("Evaluating model...")
        loss, accuracy, precision, recall = self.model.evaluate(test_generator)
        logger.info(f"Test Accuracy: {accuracy:.4f}")
        logger.info(f"Test Precision: {precision:.4f}")
        logger.info(f"Test Recall: {recall:.4f}")
        return loss, accuracy, precision, recall
    
    def predict_severity(self, image_path):
        """Predict severity level for a single image"""
        img = keras.preprocessing.image.load_img(
            image_path,
            target_size=(self.img_height, self.img_width)
        )
        img_array = keras.preprocessing.image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array /= 255.0
        
        predictions = self.model.predict(img_array)[0]
        
        return {
            'predictions': {
                'low': float(predictions[0]),
                'medium': float(predictions[1]),
                'high': float(predictions[2])
            },
            'predicted_class': self.class_labels[np.argmax(predictions)],
            'confidence': float(np.max(predictions))
        }
    
    def save_model(self, filepath):
        """Save trained model"""
        self.model.save(filepath)
        logger.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath):
        """Load trained model"""
        self.model = keras.models.load_model(filepath)
        logger.info(f"Model loaded from {filepath}")
    
    def plot_training_history(self):
        """Plot training history"""
        if self.history is None:
            logger.warning("No training history available")
            return
        
        fig, axes = plt.subplots(1, 2, figsize=(15, 5))
        
        # Plot accuracy
        axes[0].plot(self.history.history['accuracy'], label='Train Accuracy')
        axes[0].plot(self.history.history['val_accuracy'], label='Val Accuracy')
        axes[0].set_title('Model Accuracy')
        axes[0].set_xlabel('Epoch')
        axes[0].set_ylabel('Accuracy')
        axes[0].legend()
        axes[0].grid(True)
        
        # Plot loss
        axes[1].plot(self.history.history['loss'], label='Train Loss')
        axes[1].plot(self.history.history['val_loss'], label='Val Loss')
        axes[1].set_title('Model Loss')
        axes[1].set_xlabel('Epoch')
        axes[1].set_ylabel('Loss')
        axes[1].legend()
        axes[1].grid(True)
        
        plt.tight_layout()
        plt.savefig('training_history.png')
        logger.info("Training history plot saved")

# Example usage
if __name__ == "__main__":
    model = DisasterSeverityModel()
    model.build_model()
    print(model.model.summary())
