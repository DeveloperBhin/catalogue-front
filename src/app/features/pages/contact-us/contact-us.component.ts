import { Component } from '@angular/core';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent {
  name: string = '';
  email: string = '';
  subject: string = '';
  message: string = '';
  isSubmitting: boolean = false;
  submitSuccess: boolean = false;
  submitError: string = '';

  onSubmit(): void {
    // Reset previous states
    this.submitSuccess = false;
    this.submitError = '';

    // Basic validation
    if (!this.name.trim() || !this.email.trim() || !this.subject.trim() || !this.message.trim()) {
      this.submitError = 'Please fill in all fields.';
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.submitError = 'Please enter a valid email address.';
      return;
    }

    // Simulate form submission
    this.isSubmitting = true;
    
    // In a real application, you would send this to a backend API
    setTimeout(() => {
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.resetForm();
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        this.submitSuccess = false;
      }, 5000);
    }, 1000);
  }

  resetForm(): void {
    this.name = '';
    this.email = '';
    this.subject = '';
    this.message = '';
    this.submitError = '';
  }
}
