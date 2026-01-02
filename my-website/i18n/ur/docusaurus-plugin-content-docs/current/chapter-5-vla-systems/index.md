---
sidebar_position: 5
title: ویژن-لینگویج-ایکشن سسٹمز
description: روبوٹکس کے لیے ملٹی موڈل اے آئی
---

# ویژن-لینگویج-ایکشن سسٹمز

VLA (Vision-Language-Action) سسٹمز جدید ترین AI ماڈلز ہیں جو بصری ان پٹ، زبان کی ہدایات، اور روبوٹ اعمال کو یکجا کرتے ہیں۔

## VLA کیا ہے؟

VLA سسٹم ایک AI ماڈل ہے جو:

```
تصویر + زبان کی ہدایت → روبوٹ ایکشن
```

### اجزاء

1. **Vision Encoder**: تصاویر کو فیچرز میں تبدیل کرتا ہے
2. **Language Encoder**: ٹیکسٹ کو سمجھتا ہے
3. **Fusion Module**: دونوں موڈز کو یکجا کرتا ہے
4. **Action Decoder**: روبوٹ کمانڈز پیدا کرتا ہے

## Foundation Models

### CLIP

CLIP (Contrastive Language-Image Pretraining) تصاویر اور ٹیکسٹ کے درمیان تعلق سیکھتا ہے۔

### RT-2

RT-2 (Robotics Transformer 2) Google DeepMind کا ماڈل:

- ویب ڈیٹا پر پری ٹریننگ
- روبوٹ ڈیٹا پر فائن ٹیوننگ
- زیرو شاٹ جنرلائزیشن

### PaLM-E

PaLM-E گوگل کا ملٹی موڈل ایمبوڈیڈ لینگویج ماڈل:

- 562 بلین پیرامیٹرز
- ملٹیپل روبوٹکس ٹاسکس
- ویژول سوال جواب

## آرکیٹیکچر

### Transformer Based

```
[CLS] + Vision Tokens + Language Tokens → Transformer → Action Tokens
```

### Diffusion Based

- Noise سے شروع
- آہستہ آہستہ ایکشن trajectory بناتا ہے
- زیادہ متنوع اعمال

## تربیت کے طریقے

### Behavior Cloning

```
Loss = ||پیش گوئی شدہ ایکشن - ماہر ایکشن||²
```

### Reinforcement Learning

- ماحول میں تعامل
- انعام کی بنیاد پر سیکھنا
- زیادہ نمونہ درکار

### Language Conditioned RL

```python
reward = task_reward + language_alignment_reward
```

## چیلنجز

| چیلنج | حل |
|-------|-----|
| ڈیٹا کی کمی | سمیولیشن، ڈیٹا اگمنٹیشن |
| Generalization | پری ٹریننگ، ڈومین رینڈمائزیشن |
| Safety | Constraint learning، ہیومن فیڈ بیک |
| Real-time | ماڈل کمپریشن، ایج ڈپلائمنٹ |

## ایپلیکیشنز

- **گھریلو روبوٹس**: "ٹیبل صاف کرو"
- **صنعتی**: "سرخ پرزہ اٹھاؤ"
- **صحت کی دیکھ بھال**: "مریض کو پانی دو"
- **زراعت**: "پکے ٹماٹر چنو"

## باب کا خلاصہ

- VLA سسٹمز ویژن، لینگویج، اور ایکشن کو یکجا کرتے ہیں
- Foundation models جیسے RT-2 اور PaLM-E جنرلائزیشن فراہم کرتے ہیں
- تربیت behavior cloning یا RL سے ہوتی ہے
- چیلنجز میں ڈیٹا، safety، اور real-time شامل ہیں

---

*[باب 6: کیپسٹون پراجیکٹ](../chapter-6-capstone/) پر جاری رکھیں*
