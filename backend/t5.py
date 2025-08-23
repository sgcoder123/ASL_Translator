from transformers import T5Tokenizer, T5ForConditionalGeneration
import torch
from typing import List, Dict
import re

class T5ASLTranslator:
    def __init__(self, model_name: str = "t5-base"):
        """Initialize T5 translator for ASL to English translation"""
        try:
            self.tokenizer = T5Tokenizer.from_pretrained(model_name)
            self.model = T5ForConditionalGeneration.from_pretrained(model_name)
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            self.model.to(self.device)
            print(f"T5 model loaded on {self.device}")
        except Exception as e:
            print(f"Error loading T5 model: {e}")
            self.tokenizer = None
            self.model = None
    
    def preprocess_asl_sequence(self, asl_sequence: str) -> str:
        """Preprocess ASL sequence for better translation"""
        if not asl_sequence:
            return ""
        
        # Clean up the sequence
        sequence = asl_sequence.upper().strip()
        
        # Remove non-alphabetic characters
        sequence = re.sub(r'[^A-Z]', '', sequence)
        
        # Add spaces between letters for better readability
        sequence = ' '.join(sequence)
        
        return sequence
    
    def create_translation_prompt(self, asl_sequence: str) -> str:
        """Create a prompt for T5 translation"""
        if not asl_sequence:
            return "translate ASL to English: "
        
        # Create a structured prompt
        prompt = f"translate ASL to English: {asl_sequence}"
        return prompt
    
    def translate_asl_to_english(self, asl_sequence: str) -> Dict:
        """Translate ASL sequence to English"""
        if not self.model or not self.tokenizer:
            return {
                'success': False,
                'error': 'Model not loaded',
                'translation': '',
                'confidence': 0.0
            }
        
        try:
            # Preprocess ASL sequence
            processed_sequence = self.preprocess_asl_sequence(asl_sequence)
            
            if not processed_sequence:
                return {
                    'success': False,
                    'error': 'Empty ASL sequence',
                    'translation': '',
                    'confidence': 0.0
                }
            
            # Create translation prompt
            prompt = self.create_translation_prompt(processed_sequence)
            
            # Tokenize input
            inputs = self.tokenizer.encode(
                prompt, 
                return_tensors="pt", 
                max_length=512, 
                truncation=True
            ).to(self.device)
            
            # Generate translation
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs,
                    max_length=128,
                    num_beams=4,
                    early_stopping=True,
                    no_repeat_ngram_size=2,
                    temperature=0.7
                )
            
            # Decode output
            translation = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Post-process translation
            translation = self.postprocess_translation(translation)
            
            # Calculate confidence (simplified)
            confidence = min(0.95, 0.7 + len(processed_sequence) * 0.01)
            
            return {
                'success': True,
                'translation': translation,
                'confidence': confidence,
                'original_asl': asl_sequence,
                'processed_asl': processed_sequence
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'translation': '',
                'confidence': 0.0
            }
    
    def postprocess_translation(self, translation: str) -> str:
        """Post-process the generated translation"""
        if not translation:
            return ""
        
        # Clean up the translation
        translation = translation.strip()
        
        # Capitalize first letter
        if translation:
            translation = translation[0].upper() + translation[1:]
        
        # Ensure proper punctuation
        if translation and not translation.endswith(('.', '!', '?')):
            translation += '.'
        
        return translation
    
    def batch_translate(self, asl_sequences: List[str]) -> List[Dict]:
        """Translate multiple ASL sequences"""
        results = []
        for sequence in asl_sequences:
            result = self.translate_asl_to_english(sequence)
            results.append(result)
        return results
    
    def get_translation_suggestions(self, asl_sequence: str, num_suggestions: int = 3) -> List[str]:
        """Get multiple translation suggestions for an ASL sequence"""
        if not self.model or not self.tokenizer:
            return []
        
        try:
            processed_sequence = self.preprocess_asl_sequence(asl_sequence)
            prompt = self.create_translation_prompt(processed_sequence)
            
            inputs = self.tokenizer.encode(
                prompt, 
                return_tensors="pt", 
                max_length=512, 
                truncation=True
            ).to(self.device)
            
            # Generate multiple outputs
            outputs = self.model.generate(
                inputs,
                max_length=128,
                num_return_sequences=num_suggestions,
                num_beams=4,
                early_stopping=True,
                no_repeat_ngram_size=2,
                temperature=0.8,
                do_sample=True
            )
            
            suggestions = []
            for output in outputs:
                translation = self.tokenizer.decode(output, skip_special_tokens=True)
                translation = self.postprocess_translation(translation)
                suggestions.append(translation)
            
            return suggestions
            
        except Exception as e:
            print(f"Error generating suggestions: {e}")
            return []
    
    def cleanup(self):
        """Clean up resources"""
        if self.model:
            del self.model
        if self.tokenizer:
            del self.tokenizer
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
