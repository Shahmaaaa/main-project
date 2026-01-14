# AI Model Development Guide

## Overview

The Block-Aid AI model uses **EfficientNet-B0** with transfer learning to classify disaster severity from images.

## Model Architecture

```
Input (224×224×3)
    ↓
EfficientNet-B0 (Pre-trained on ImageNet)
    ↓
Global Average Pooling
    ↓
Dense (256) + BatchNorm + Dropout(0.3)
    ↓
Dense (128) + BatchNorm + Dropout(0.3)
    ↓
Dense (3) with Softmax
    ↓
Output: [Low, Medium, High] Probabilities
```

## Training Process

### 1. Data Preparation

```python
from disaster_model import DisasterSeverityModel

model = DisasterSeverityModel(img_height=224, img_width=224)
train_gen, val_gen = model.get_data_generators('path/to/data', batch_size=32)
```

Expected directory structure:
```
data/
├── low/
│   ├── image1.jpg
│   ├── image2.jpg
│   └── ...
├── medium/
│   └── ...
└── high/
    └── ...
```

### 2. Model Building

```python
model.build_model()
print(model.model.summary())
```

### 3. Training

```python
history = model.train(train_gen, val_gen, epochs=25)
model.save_model('disaster_model.h5')
```

### 4. Evaluation

```python
loss, accuracy, precision, recall = model.evaluate(test_generator)
model.plot_training_history()
```

## Inference

### Single Image Prediction

```python
from disaster_model import DisasterSeverityModel

model = DisasterSeverityModel()
model.load_model('best_model.h5')

result = model.predict_severity('path/to/image.jpg')

print(result)
# Output:
# {
#   'predictions': {
#     'low': 0.15,
#     'medium': 0.70,
#     'high': 0.15
#   },
#   'predicted_class': 'Medium',
#   'confidence': 0.70
# }
```

## Severity Scoring

The severity calculator combines AI predictions with environmental factors:

```python
from severity_calculator import SeverityScoreCalculator

calculator = SeverityScoreCalculator()

result = calculator.calculate_total_score(
    ai_predictions={'low': 0.1, 'medium': 0.3, 'high': 0.6},
    rainfall_mm=120,
    water_level_cm=85,
    population_affected=5000,
    infrastructure_damage=65,
    impact_area=35
)

print(result)
# Output:
# {
#   'total_score': 68.5,
#   'severity_level': 'MEDIUM',
#   'component_scores': {...},
#   'confidence': 0.85
# }
```

## Weighting System

| Factor | Weight |
|--------|--------|
| Image Analysis | 40% |
| Rainfall Intensity | 10% |
| Water Level | 10% |
| Population Affected | 15% |
| Infrastructure Damage | 15% |
| Impact Area | 10% |

## Severity Thresholds

| Level | Score Range |
|-------|------------|
| LOW | 0 - 40 |
| MEDIUM | 41 - 70 |
| HIGH | 71 - 100 |

## Hyperparameters

```python
# Model
- Base Model: EfficientNet-B0
- Pre-trained: ImageNet
- Input Size: 224×224×3
- Optimizer: Adam (lr=1e-3)
- Loss: Categorical Crossentropy
- Metrics: Accuracy, Precision, Recall

# Training
- Epochs: 25
- Batch Size: 32
- Validation Split: 0.2
- Early Stopping: patience=5
- Learning Rate Reduction: factor=0.5, patience=3
```

## Data Augmentation

```python
ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest'
)
```

## Model Performance Metrics

Expected metrics (on test set):
- **Accuracy**: 85-90%
- **Precision**: 0.82-0.88
- **Recall**: 0.80-0.85
- **F1-Score**: 0.81-0.86

## Improving Model Performance

### Data Collection
- Gather more diverse disaster images
- Balance dataset across classes
- Include various lighting conditions
- Use data augmentation

### Model Optimization
- Experiment with EfficientNet-B2 or B3
- Adjust layer sizes and dropout rates
- Fine-tune learning rate
- Use ensemble methods

### Parameter Tuning
- Adjust severity thresholds
- Change component weights
- Modify normalization ranges
- A/B test different approaches

## Deploying the Model

### Save Model
```python
model.save_model('disaster_model.h5')
```

### Load Model
```python
model = DisasterSeverityModel()
model.load_model('disaster_model.h5')
```

### Batch Prediction
```python
import os
import numpy as np

images_dir = 'path/to/images'
predictions = []

for img_file in os.listdir(images_dir):
    result = model.predict_severity(os.path.join(images_dir, img_file))
    predictions.append({
        'image': img_file,
        'prediction': result
    })

# Save predictions
import json
with open('predictions.json', 'w') as f:
    json.dump(predictions, f)
```

## Model Versioning

Track model versions:
```python
models/
├── v1.0_baseline.h5
├── v1.1_improved.h5
├── v1.2_production.h5
└── metadata.json
```

## Integration with Backend

The Flask backend loads the model at startup:

```python
try:
    disaster_model = DisasterSeverityModel()
    model_path = os.getenv('MODEL_PATH', 'best_model.h5')
    if os.path.exists(model_path):
        disaster_model.load_model(model_path)
except Exception as e:
    logger.error(f"Failed to load AI model: {e}")
    disaster_model = None
```

## Troubleshooting

### Model Not Loading
```python
# Check file exists
import os
print(os.path.exists('best_model.h5'))

# Check TensorFlow version
import tensorflow as tf
print(tf.__version__)
```

### Prediction Issues
```python
# Verify input shape
from PIL import Image
img = Image.open('disaster.jpg')
print(img.size)  # Should be resizable to 224×224

# Check tensor dimensions
import tensorflow as tf
input_tensor = tf.random.normal((1, 224, 224, 3))
output = model.model(input_tensor)
print(output.shape)
```

### Training Memory Issues
```python
# Reduce batch size
batch_size = 16  # instead of 32

# Use mixed precision
from tensorflow.keras import mixed_precision
policy = mixed_precision.Policy('mixed_float16')
```

## References

- [EfficientNet Paper](https://arxiv.org/abs/1905.11946)
- [Transfer Learning Guide](https://tensorflow.org/tutorials/images/transfer_learning)
- [Keras Documentation](https://keras.io/)

---

For integration with the Flask API, see [../backend/app.py](../backend/app.py)
