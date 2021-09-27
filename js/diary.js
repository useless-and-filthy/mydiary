var url = new URL(window.location.href);
var objId = url.searchParams.get("id");

const loading_icon=document.getElementById('loading_icon');
const html_txt=document.getElementById('html_txt');
const title_txt=document.getElementById('title_txt');
const categories_txt=document.getElementById('categories_txt');
const content_txt=document.getElementById('content_txt');
const saveBtn=document.getElementById('saveBtn');
const helper_txt=document.getElementById('helper_txt');
const html_on=document.getElementById('html_on');
const html_off=document.getElementById('html_off');


const Diaries = Parse.Object.extend("Diaries");
const query = new Parse.Query(Diaries);
var currentDiary;

var currentUser = Parse.User.current();
  if (!currentUser) {
    window.location = 'login.html';
  }else{
    if(objId){
      load();
    }else{
      console.log("new diary")
      currentDiary=new Diaries();
      loading_icon.style.display='none';
      saveBtn.disabled = false;
      showUI();
    }
  }


function load(){
    query.get(objId)
    .then((diary) => {
      currentDiary=diary;
      updateUI(diary);
    }, (error) => {
      alert(error.message);
    });
}


function showUI() {
  document.getElementById('main_container').style.display="block";
  document.getElementById('main_nav').style.display="block";
}

function updateUI(diary){
  showUI();
    //title
    title_txt.innerHTML=diary.get("title");
    //tags
    categories_txt.value=diary.get("categories");
    //content
    html_txt.value=diary.get("content");
    content_txt.innerHTML=diary.get("content");

    saveBtn.disabled = false;
    loading_icon.style.display='none';
}

saveBtn.addEventListener("click", function() {
  helper_txt.style.display="flex";
  saveBtn.disabled = true;
  helper_txt.innerHTML="Saving..."
  currentDiary.setACL(new Parse.ACL(Parse.User.current()));
  currentDiary.set("title", title_txt.innerText);
  currentDiary.set("categories", getCategoriesArray());
  currentDiary.set("content", html_txt.value);
  currentDiary.set("user", currentUser);
  
  currentDiary.save().then((currentDiary) => {
    // Execute any logic that should take place after the object is saved.
    alert('Diary Saved');
    objId=currentDiary.id;
    currentDiary=currentDiary;
    saveBtn.disabled=false;
    helper_txt.innerHTML="Saved !";
  }, (error) => {
    // Execute any logic that should take place if the save fails.
    // error is a Parse.Error with an error code and message.
    alert(error.message);
    saveBtn.disabled=false;
    helper_txt.innerHTML="Error Saving!";
  });
});


  function getCategoriesArray(){
    myArr = [];
    
    categories_txt.value.trim().split(',').forEach(function (value, index, array) {
     if(value.trim()){
      myArr.push(value.trim());
     }
    });

  return myArr.sort();
}


  const objDiv = document.getElementById("contentDiv");

  function htmlChanged(){
    helper_txt.style.display="none";
    content_txt.innerHTML=html_txt.value;
  }

  content_txt.addEventListener("input", function() { textChanged();}, false);

  function textChanged(){
    helper_txt.style.display="none";
    html_txt.value=content_txt.innerHTML;
  }


  function tagsValidation(){
    var source=categories_txt.value;
    for (let i =0; i < source.length; i++) {
      if(i>0 && source.charAt(i-1)===' ' && source.charAt(i)===' '){
        part1 = source.substring(0, i-1);
        part2 = source.substring(i, source.length);
        categories_txt.value = (part1 + part2);
      }
      
      if (!((/[a-zA-Z]/).test(source.charAt(i)) || (/^\d$/).test(source.charAt(i)) || source.charAt(i)===';' || source.charAt(i)===' ')) {
        part1 = source.substring(0, i);
        part2 = source.substring(i + 1, source.length);
        categories_txt.value = (part1 + part2);
      }
  }
}

function mAddVideo(t){
  

}
var file;

const mImgURL=document.getElementById('image_url_txt');
const mImgFile=document.getElementById('image_file');
const imgModalSave=document.getElementById('image_modal_save');

const mVidURL=document.getElementById('video_url_txt');
const mYTVidURL=document.getElementById('yt_video_url_txt');
const mVidFile=document.getElementById('video_file');
const vidModalSave=document.getElementById('video_modal_save');

mImgFile.addEventListener('change', (event) => {
    file = event.target;
    file = new Parse.File(getFileName(), file.files[0]);
    //console.log("type",file.files[0].type)
    //console.log("extension",file.value.substr(file.value.lastIndexOf('\\') + 1).split('.')[1]);
  });

imgModalSave.addEventListener('click',function(){
  if(isValidHttpUrl(mImgURL.value)){
    //put the url
    putImageURLInHTML(mImgURL.value);
  }else{
    //to upload
    file.save().then(function(file) {
      //The file has been saved to Parse.
      //console.log(file);
      putImageURLInHTML(file._url);
    }, function(error) {
      // The file either could not be read, or could not be saved to Parse.
      alert(error.message);
    });
    
  }

});

mVidFile.addEventListener('change', (event) => {
  file = event.target;
  file = new Parse.File(getFileName(), file.files[0]);
  //console.log("type",file.files[0].type)
  //console.log("extension",file.value.substr(file.value.lastIndexOf('\\') + 1).split('.')[1]);
});

vidModalSave.addEventListener('click',function(){

if(isValidHttpUrl(mVidURL.value)){
  putVideoURLInHTML(mVidURL.value);
}else if(isValidHttpUrl(mYTVidURL.value)){
  putYTVideoURLInHTML(mYTVidURL.value);
}else{
  //to upload
  file.save().then(function(file) {
    //The file has been saved to Parse.
    //console.log(file);
    putVideoURLInHTML(file._url);
  }, function(error) {
    // The file either could not be read, or could not be saved to Parse.
    alert(error.message);
  });
  
}

});


function putImageURLInHTML(url){
  html_txt.value=html_txt.value + getImageHTML(url);
  htmlChanged();
  $('#img_modal').modal('hide');
  resetModal();
}

function putVideoURLInHTML(url){
  html_txt.value=html_txt.value + getVideoHTML(url);
  htmlChanged();
  $('#vid_modal').modal('hide');
  resetModal();
}

function putYTVideoURLInHTML(url){
  html_txt.value=html_txt.value + getYTVideoHTML(url);
  htmlChanged();
  $('#vid_modal').modal('hide');
  resetModal();
}

function getImageHTML(URL){
  return `<img width="100%" height="auto" style="min-height:200px" src="`+URL+`" alt="Image"> <div><br></div><div><br></div>`;
}

function getVideoHTML(URL){
  return `<video width="100%" height="auto" style="min-height:240px" src="`+URL+`" controls="true"></video><br><br><br>`;
}

function getYTVideoHTML(URL){
  const yid=getId(URL);
  return `<iframe width="100%" height="auto" style="min-height:240px" src="https://www.youtube.com/embed/`+yid+`" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe><br><br><br>`;
}

function getId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return (match && match[2].length === 11)
    ? match[2]
    : null;
}


function getFileName() {
  return "a" +"."+ file.value.substr(file.value.lastIndexOf('\\') + 1).split('.')[1];
}

function isValidHttpUrl(string) {
  let url;
  
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function resetModal(){
mImgURL.value="";
mImgFile.value="";

mVidURL.value="";
mYTVidURL.value="";
mVidFile.value="";
}


function showHideHTMLCode(checkbox){
  if(checkbox.checked){
    document.getElementById('html_container').style.display="block";
    document.getElementById('content_container').classList.remove('col-md-9');
    document.getElementById('content_container').classList.add('col-md-6');
    
  }else{
    document.getElementById('html_container').style.display="none";
    document.getElementById('content_container').classList.remove('col-md-6');
    document.getElementById('content_container').classList.add('col-md-9');
  }
}