function hideAndShow(){
    const box1=document.getElementById('roomboxes');
    const box2 = document.getElementById('gamebox');
    box1.style.display='none';
    box2.style.display='block';
    const box6 = document.getElementById('profilediv');
    box6.style.display='none';
}
function EnteredUserName(){
    const box4 = document.getElementById('UserNameField');
    const box5 = document.getElementById('roomboxes');
    box5.style.display='block';
    box4.style.display='none';
}
