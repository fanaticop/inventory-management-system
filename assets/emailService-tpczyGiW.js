import{c as a}from"./index-CB1YhNA-.js";var n={};const i=n.VITE_SUPABASE_URL||"",c=n.VITE_SUPABASE_ANON_KEY||"",d=a(i,c),l=async({to:s,subject:r,content:o,replyTo:t})=>{try{const{error:e}=await d.functions.invoke("send-email",{body:{to:s,subject:r,content:o,replyTo:t}});if(e)throw new Error(`Failed to send email: ${e.message}`);return{success:!0}}catch(e){throw console.error("Email sending failed:",e),e}},u=async(s,r)=>{const o="Password Reset Request",t=`
    <h2>Password Reset Request</h2>
    <p>You recently requested to reset your password. Click the link below to reset it:</p>
    <p><a href="${r}" style="padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
    <p>If you didn't request this, please ignore this email.</p>
    <p>This link will expire in 1 hour for security purposes.</p>
  `;return l({to:s,subject:o,content:t})};export{l as sendEmail,u as sendPasswordResetEmail};
//# sourceMappingURL=emailService-tpczyGiW.js.map
