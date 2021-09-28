var currentUser = Parse.User.current();
  if (!currentUser) {
    window.location = 'login.html';
  }

var url = new URL(window.location.href);
var searchArg = url.searchParams.get("search");

const categories_container=document.getElementById('categories_container')
const diary_container=document.getElementById('diary_container');
const loading_icon=document.getElementById('loading_icon');
const nextBtn=document.getElementById('nextBtn');
const pageIndex=document.getElementById('pageIndex');

var currentCategory="All";

//get all diaries
async function getDiaries(prevPage,nextPage) {
  loading_icon.style.display="block";
  clearContainer();

  //init parse
  const Diaries = Parse.Object.extend("Diaries");
  const query = new Parse.Query(Diaries);
  query.equalTo("user", currentUser);
  query.descending("updatedAt");
  query.limit(10);

  //add category to query if required
  if(currentCategory != 'All'){
    query.equalTo('categories',currentCategory)
  }

  //add search to query
  if(searchArg){
    query.fullText('content', searchArg);
  }

  //adding pagination to query
  if(prevPage){
    var pg=1*pageIndex.innerText;
    var skipBy=(pg-2)*10;
    query.skip(skipBy);
    pageIndex.innerHTML=(pg-1)+"";
  }else if(nextPage){
    var pg=1*pageIndex.innerText;
    var skipBy=pg*10;
    query.skip(skipBy);
    pageIndex.innerHTML=(pg+1)+"";
  }

  //get the result
  var results = await query.find();
  for (let i = 0; i < results.length; i++) {
    addDiaryUI(results[i]);
  }

  loading_icon.style.display="none";
}

//first run - Default
getDiaries();

//adding categories in UI
Parse.Cloud.run("getCategories").then(function(allCategories) {
  addCategoryUI("All");

  for (let i = 0; i < allCategories.length; i++) {
    if(allCategories[i].trim()){
      addCategoryUI(allCategories[i].trim());
    }
  }
}).catch(function(error){
    console.log("Error: " + error.code + " " + error.message);
});


function addCategoryUI(catName){
/* <a href="#" class="list-group-item list-group-item-action active"> Cras justo odio </a> */
  const a=document.createElement('a');
  a.className='list-group-item list-group-item-action';


    a.innerHTML=catName;
    if(catName==currentCategory){
      a.classList.add('active');
    }

  a.addEventListener('click',function (){
      currentCategory=a.innerText;
      toggleCategories();
      getDiaries(false,false);
  });
  
  categories_container.appendChild(a);
}

function addDiaryUI(data){
  var column =document.createElement('div');
  column.className="mb-3 w-100";
  
  var card=document.createElement('div');
  card.className='card';
  
  var card_body=document.createElement('div');
  card_body.className="card-body";

  var card_title=document.createElement('h4');
  card_title.className="card-title";
  card_title.innerHTML=data.get('title');

  var card_created_at=document.createElement('p');
  card_created_at.className="card-text";
  card_created_at.innerHTML=data.get('created_at')+"";

  var card_text=document.createElement('p');
  card_text.className="card-text";
  card_text.innerHTML=data.get('content').replace(/<[^>]*>/g, '');
  card_text.style.height="4.5rem";
  card_text.style.overflow="hidden";

  var cover;
  if(data.get('content').includes("<img width=") ){
    cover=document.createElement('img');
    cover.style.maxHeight="425px";
    cover.src=getImageLink(data.get('content'));
  }else if(data.get('content').includes("<iframe width=")){
    cover=document.createElement('iframe');
    cover.style.width="100%";
    cover.style.minHeight="350px";
    cover.src=getYTLink(data.get('content'));
  }else if(data.get('content').includes("<video width=")){
    cover=document.createElement('video');
    cover.style.width="100%";
    cover.style.minHeight="350px";
    cover.controls="true";
    cover.src=getVideoLink(data.get('content'));
  }else{
    //no cover, increase card height for 5 lines 5*1.5
    card_text.style.height="10.5rem";
  }

  var card_btn=document.createElement('a');
  card_btn.className="btn btn-primary";
  card_btn.innerHTML="Read more";
  card_btn.href="diary.html?id="+data.id;

  card_body.appendChild(card_title);
  card_body.appendChild(card_created_at);
  card_body.appendChild(card_text);
  card_body.appendChild(card_btn);

  if(cover){
    cover.className="card-img-top";
    card.appendChild(cover);
  }
  
  card.appendChild(card_body);

  column.appendChild(card);

  diary_container.appendChild(column);
}

function toggleCategories() {
  var children = categories_container.children;

  for (let i = 0; i < children.length; i++) {
    const aTag=children[i];
    if(aTag.innerText == currentCategory){
        aTag.classList.add("active");
      }else{
        aTag.classList.remove("active");
      }
  }
}

function nextPage() {
  if(diary_container.children.length>0){
    getDiaries(false,true)
  }
}

function prevPage() {
  if(1*pageIndex.innerText>1){
    getDiaries(true,false);
  }
}

function getImageLink(htmlTxt){
var elem = document.createElement('div');
elem.innerHTML = htmlTxt;
return elem.querySelector('img').src;
}

function getVideoLink(htmlTxt){
  var elem = document.createElement('div');
  elem.innerHTML = htmlTxt;
  return elem.querySelector('video').src;
}

function getYTLink(htmlTxt){
  var elem = document.createElement('div');
  elem.innerHTML = htmlTxt;
  return elem.querySelector('iframe').src;
}

function clearContainer(){
  while (diary_container.hasChildNodes()) {  
    diary_container.removeChild(diary_container.firstChild);
  }
}