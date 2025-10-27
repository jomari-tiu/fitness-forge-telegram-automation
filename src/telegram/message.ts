import { CreateInquiryDto } from 'src/schemas/inquiry.schema';

export const welcomeMessage = `
🏋️ *Welcome to Forge Fitness!*

I'm here to help you with information about our gym and services. What would you like to know?

Choose an option below or type your question:
    `;

export const helpMessage = `
    🤖 *Forge Fitness Bot Help*
    
    *Available Commands:*
    /start - Show main menu
    /pricing - View membership pricing
    /timetable - View class schedule
    /today - Today's classes
    /tomorrow - Tomorrow's classes
    /pt - Personal training packages
    /promotions - Current promotions
    /contact - Contact information
    /help - Show this help message
    
    *Quick Actions:*
    • Use the inline buttons for easy navigation
    • Type any question and I'll try to help
    • Use /contact to speak with our team
    
    Need immediate assistance? Call us or visit our gym!
        `;

export const helpfulMessage = `
        🤔 I'd be happy to help! Here are some things I can assist you with:
        
        💰 Membership pricing and packages
        📅 Class schedules and timetables  
        🏃 Personal training options
        🎉 Current promotions and offers
        📞 Contact information
        
        You can also use the menu below or ask me specific questions about our gym services!
              `;

export const submissionFailedMessage = `
              ❌ *Submission Failed*
              
              Sorry, there was an error submitting your request. Please try again or contact us directly:
              
              📧 jomaritiu16@gmail.com
              🌐 https://forge-fitness-phi.vercel.app/
              
              We apologize for the inconvenience!
                    `;

export const submissionSuccessMessage = (inquiry: CreateInquiryDto) => {
  return `
              ✅ *Submission Success*
              
              Thank you for your request! We've received your information:
              
              📧 Email: ${inquiry.email}
              📞 Phone: ${inquiry.phone}
              🎯 Interest: ${inquiry.preferredClass}

              Our team will contact you within 24 hours. We're excited to help you on your fitness journey!

              *In the meantime, feel free to explore more about our services:*
            `;
};
