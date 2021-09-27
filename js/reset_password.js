const messageView=document.getElementById('help_text')
function sendLink(){
    const email=document.getElementById('email');
    firebase.auth().sendPasswordResetEmail(email.value).then(function() {
      messageView.innerHTML="Reset email sent."
    }).catch(function(error) {
      messageView.innerHTML=error.message;
    });
}