document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit',event => {
      event.preventDefault()

      fetch('/emails' , {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value,
        read: false
      })
    })
    .then(response => response.json())
    .then(result => {
      load_mailbox('sent');
      console.log(result)
    })

  });
  
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  const view = document.querySelector('#emails-view')
  view.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch('/emails/'+mailbox)
  .then(request => request.json())
  .then(result =>{
    result.forEach(element => {
      const div = document.createElement('div');
      div.innerHTML =`
      <tr>
      <table class="table table-striped">
      <th scope="col"><b>${element.sender}</b> </th>
      <th scope="col"><b>${element.subject}</b> </th>
      <th scope="col"><b>${element.timestamp}</b> </th>
      </tr>
      </table>
      `;
      div.addEventListener('click',() => load_element(element.id));
      view.appendChild(div);
  

      
    });
  })
}

function load_element(email){
  const maill = document.querySelector('#emails-view')

  document.querySelector('#emails-view').style.display = 'none';
  maill.style.display = 'block'; 
  document.querySelector('#compose-view').style.display = 'none'; 

  fetch('/emails/'+email)
  .then(response => response.json())
  .then(email => {
    maill.innerHTML = `
    <div><strong>From:</strong> <span>${email.sender}</span><div>
    <div><strong>To:</strong> <span>${email.recipients}</span><div>
    <div><strong>Subject:</strong> <span>${email.subject}</span><div>
    <div><strong>Timestamp:</strong> <span>${email.timestamp}</span><div>
    <div><strong>Body:</strong> <span>${email.body}</span><div>
    <button class="btn btn-sm btn-outline-primary mt-2" id="reply" >Reply</button>
  `;
  const repli = document.querySelector('#reply');
  repli.addEventListener('click', () =>{
  if(email.sender === email.recipients){
    repli.remove();
  }
  else{
    reply(email.id)
  }
  })
  

  })
}

function reply(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {    
    compose_email();
    document.querySelector('#compose-recipients').value = email.sender;
    document.querySelector('#compose-subject').value = "Re: " + email.subject;
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
  })
  .catch(error => {
    console.log(error)
  });

}
