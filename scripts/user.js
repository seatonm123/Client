 const URL = SERVER_URL;
 let globalEventArray = [];
 let globalCategoryArray = [];
 let user = {};
 $(document).ready(function() {

     getUserInfo()
         .then((myInfo) => {
             user = myInfo;
             populateUserInfo(user);
         })
         .then(() => {
             return getCategories()
         })
         .then((categoryArray) => {
             globalCategoryArray = categoryArray;
             populateCategories(categoryArray);
         })
         .then(() => {
             setGlobalEventHandlers();
         })

     getEvents()
         .then((eventArray) => {
             return sortEvents(eventArray);
         })
         .then((sortedEventArray) => {
             const normalizedEventArray = sortedEventArray.map((event) => {
                 const normalizedEvent = normalizeData(event);
                 return normalizedEvent;
             });
             return normalizedEventArray
         })
         .then((normalizedEventArray) => {
             return filterPastEvents(normalizedEventArray);
         })
         .then((cleanEventArray) => {
             globalEventArray = cleanEventArray;
             populateEvents(cleanEventArray)
         })
         .then((data) => {
             let imageData = globalEventArray;
             populateImages(imageData);
         })
         .catch((error) => {
             console.log(error);
             console.log(error.status);
             //  if (res.status === 500) {
             //  alert("Sorry... our bad. Reloading the page.");
             //  window.location.reload();
             //  }
         });





 });

 function getEvents() {
     let data = $.get(`${URL}/events`);
     return data;
 }

 function sortEvents(eventData) {

     let returnData = eventData.sort(function compare(objectA, objectB) {
         if (objectA.date < objectB.date) { //a is less than b by some ordering criterion
             return -1;
         }
         if (objectA.date > objectB.date) { //a is greater than b by the ordering criterion
             return 1;
         }
         // a must be equal to b
         return 0;
     });
     return returnData;
 }

 function populateEvents(eventArray) {
     eventArray.forEach((event) => {
         populateEvent(event);
         createEventsEventHandler(event.id);
     });

 }

 function populateEvent(event) {
     const parent = $('.card-container');
     const source = $(`#card-template`).html();
     const template = Handlebars.compile(source);
     const html = template(event);
     parent.append(html);
 }

 function populateImages(imageData) {
     for (var j = 0; j < 3; j++) {
         let index = null;
         let thisEvent = null;
         let image_link = null;
         let counter = 0;
         while (image_link === null && (counter < 200)) {
             index = generateRandomIndex(imageData.length);
             thisEvent = imageData[index];
             image_link = thisEvent.image_link;
             counter += 1;
         }


         const $thisCarouselCard = $(`#image-card-${j}`);
         const $thisH2 = $(`#caption-${j}`);
         $thisH2.text(`${thisEvent.event_name}`);
         $thisCarouselCard.css(`background-image`, `url(${image_link})`);

     }
 }

 function generateRandomIndex(max) {
     const index = Math.floor(Math.random() * max);
     return index;
 }

 function getUserInfo() {
     let data = $.get(`${URL}/myInfo`);
     return data;
 }

 function populateUserInfo(user) {
     const $parent = $('.welcome-container');
     const source = $(`#welcome-template`).html();
     const template = Handlebars.compile(source);
     const html = template(user);
     $parent.append(html);
 }


 function createEventsEventHandler(eventID) {

 }

 function setGlobalEventHandlers() {
     $('#logout').click(() => {
         $.get(`${URL}/logout`);
     });
     createCategoriesEventHandler("all");
 }


 function getCategories() {
     let data = $.get(`${URL}/category`);
     return data;
 }

 function populateCategories(categoryArray) {
     categoryArray.forEach((category) => {
         const $parent = $('.category-container');
         const source = $(`#category-template`).html();
         const template = Handlebars.compile(source);
         const html = template(category);
         $parent.append(html);
         createCategoriesEventHandler(category.id);
     });
 }

 function createCategoriesEventHandler(categoryID) {
     const $thisCategory = $(`.category-${categoryID}`);
     $thisCategory.click(() => {
         $thisCategory.addClass('selected');
         $thisCategory.siblings().removeClass('selected');
         const $parent = $('.card-container');
         $parent.empty();
         filterCategories(categoryID);
     })
 }

 function filterCategories(categoryID) {
     let categoryName = null;

     if (categoryID !== "all") {
         categoryName = globalCategoryArray[categoryID - 1].name;
     }

     globalEventArray.forEach((event) => {
         let shouldPopulate = false;
         const eventCategories = event.categories;
         if (categoryID == "all") {
             shouldPopulate = true;
         } else {
             eventCategories.forEach((category) => {
                 if (categoryName == category) {
                     shouldPopulate = true;
                 }
             })
         }

         if (shouldPopulate) {
             populateEvent(event);
         }

     })
 }

 $(function carousel() {
     $('.carousel').carousel({
         interval: 3000
     });
 });

 function filterPastEvents(eventArray) {
     const filteredEventArray = eventArray.filter((event) => {
         return event.isValid;
     });
     return filteredEventArray;
 }

 function normalizeData(event) {

     if (!event.source_name) {
         event.source_name = "No Source Name Specified";
     }

     if (!event.event_link) {
         event.event_link = "No Link Available";
     }

     if (!event.description) {
         event.description = "Description Unavailable"
     }

     let date = null;
     let possibleDate = null;
     if (event.date) {
         try {
             diff = Sugar.Date('today').hoursUntil(event.date).raw;
             if (diff >= 0) {
                 possibleDate = Sugar.Date(event.date).format('{Dow}, {Month} {dd}, {yyyy}').raw;
                 event.isValid = true;
             } else {
                 event.isValid = false;
             }
         } catch (err) {
             possibleDate = event.date;
             event.isValid = false;
         }
         event.date = possibleDate;
     } else {
         event.isValid = false;
     }

     if (!event.time) {
         event.time = "TBD";
     }

     if (!event.event_name) {
         event.event_name = "Event Name Unavailable";
     }


     if (!event.image_link) {
         //ImageLink deliberately left null
     }

     if (!event.location) {
         event.location = "TBD";
     }

     if (!event.address) {
         event.address = "TBD";
     }

     if (!event.price) {
         event.price = "TBD";
     }

     if (!event.categories) {
         event.categories = ["Miscellaneous"];
     }

     return event;
 }
