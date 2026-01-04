import{c}from"./index-C0WfP_Lf.js";var u={};const n=u.VITE_SUPABASE_URL||"",i=u.VITE_SUPABASE_ANON_KEY||"",l=n&&i?c(n,i):null,d=async({to:e,subject:o,content:t,replyTo:r})=>{try{if(!l){const a=JSON.parse(localStorage.getItem("demo_email_outbox")||"[]");return a.push({to:e,subject:o,content:t,replyTo:r,sentAt:new Date().toISOString()}),localStorage.setItem("demo_email_outbox",JSON.stringify(a)),console.info("EmailService: supabase not configured — saved email to demo_email_outbox",{to:e,subject:o}),{success:!0,debug:{outboxKey:"demo_email_outbox"}}}const{error:s}=await l.functions.invoke("send-email",{body:{to:e,subject:o,content:t,replyTo:r}});if(s)throw new Error(`Failed to send email: ${s.message}`);return{success:!0}}catch(s){throw console.error("Email sending failed:",s),s}},m=async(e,o)=>{const t="Password Reset Request",r=`
    <h2>Password Reset Request</h2>
    <p>You recently requested to reset your password. Click the link below to reset it:</p>
    <p><a href="${o}" style="padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
    <p>If you didn't request this, please ignore this email.</p>
    <p>This link will expire in 1 hour for security purposes.</p>
  `;return d({to:e,subject:t,content:r})};export{d as sendEmail,m as sendPasswordResetEmail};
//# sourceMappingURL=emailService-CKUM0ooB.js.map
