// config vars

var filtersCookieName = 'polyclave_filter_state';

/*
(function(window, $, PhotoSwipe){
    
    $(document).ready(function(){
        
        $('div.gallery-page')
            .live('pageshow', function(e){
                
                var 
                    currentPage = $(e.target),
                    options = {},
                    photoSwipeInstance = $("ul.gallery a", e.target).photoSwipe(options,  currentPage.attr('id'));
                    
                return true;
                
            })
            
            .live('pagehide', function(e){
                
                var 
                    currentPage = $(e.target),
                    photoSwipeInstance = PhotoSwipe.getInstance(currentPage.attr('id'));

                if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance != null) {
                    PhotoSwipe.detatch(photoSwipeInstance);
                }
                
                return true;
                
            });
        
    });

}(window, window.jQuery, window.Code.PhotoSwipe));
*/

// this is run with every page loaded - may be cached though?
$(document).bind('pageinit', function(e, data) {
    console.log("- pageinit -");
    
    // we need to clear the filter 
    $('#filter-clear-button').click(function(){
         e.stopImmediatePropagation();
         saveCurrentStates([]);
         resetSpeciesScores();
         initFilterPage();
     });
     
     //playing the media
     $('#polyclave-audio-button').on('click', function(e){
         e.stopImmediatePropagation();
         console.log('audio button pressed');
         
         // if it is playing then stop it.
         if($('#polyclave-audio-button').data('playing')){
             console.log('playing so going pausing');
             $('#polyclave-audio')[0].pause();
             $('#polyclave-audio-button').html('Play Audio');
             $('#polyclave-audio-button').data('playing', false);
         }else{
             console.log('Not playing so going to play');
             $('#polyclave-audio')[0].play();
             $('#polyclave-audio-button').html('Stop Audio');
             $('#polyclave-audio-button').data('playing', true);
            
         }
         
     });
     
     // media finished
     $('#polyclave-audio').bind('ended', function(){
         $('#polyclave-audio-button').html('Play Audio');
         $('#polyclave-audio-button').data('playing', false);
     });
     

});
    
// This is called when moving between pages first with the
// uri then with the fragment of dom that is about to be displayed.
$(document).bind( "pagecontainerbeforechange", function( e, data ) {


    // When received with data.toPage set to a string, the event indicates that navigation is about to commence.
    //The value stored in data.toPage is the URL of the page that will be loaded.
    if( typeof data.toPage === "string" ){
      
      // urls are designed of the form #some-page?key1=value1&key2=value1
      // the key/values are set as global values i.e. change the state of the app
     var u = $.mobile.path.parseUrl( data.toPage );
     if(u.hash){
         var search_part = u.hash.substring(u.hash.indexOf('?') +1 );
         var vars = search_part.split('&');
         for (var i = 0; i < vars.length; i++) {
             var pair = vars[i].split('=');
             setCookie(decodeURIComponent(pair[0]),decodeURIComponent(pair[1]),365);
         }
     }
     
    // When received with data.toPage set to a jQuery object, the event indicates that the destination page has been loaded and navigation will continue.
    } else {
        
        // at this point the page has been loaded into the dom and we are
        // about to switch it to visible - change it now if we need to!
        console.log("- pagebeforechange -");
        console.log(data.toPage);
        console.log("about to show " + data.toPage.attr("id"));
     
        // switch statement to call the page update functions...
        switch(data.toPage.attr("id")){
            case 'about-page':
                initAboutPage();
                break;
            case 'species-page':
                initSpeciesPage( data.toPage.attr("id") );
                break;
            case 'profile-page':
                initProfilePage(data);
                break;
            case 'filter-page':
                initFilterPage( data.toPage.attr("id") );
                break;
            case 'score-page':
                initScorePage();
                break;
            default:
                console.log("No init method for " + data.toPage.attr("id"));
        }
        
    
    }
    
    
});

   // Called after the page has become visible.
    $(document).bind( "pagecontainershow", function( e, data ) {
        
        // this ensures the check boxes on the score pages are updated
        // could perhaps be run only with score pages for efficiency 
        // but no harm in making sure all checkboxes are up to date!
        switch(data.toPage.attr("id")){
            case 'filter-page':
                $("input[type='checkbox']", data.toPage).checkboxradio("refresh");
                break;
            case 'species-page':
                $("html, body").animate({ "scrollTop" : polyclave_data.species_last_scroll }, 500);
                break;
            default:
                console.log("No pagechange method for " + data.toPage.attr("id"));
            
        }
        
    });


/* 
    Init the about page - may not do anything
*/
function initAboutPage(){
    console.log('initAboutPage');
    $('#about-page-subtitle').html( polyclave_data.created );
}

function initProfilePage(data){
    console.log('initProfilePage: ' + getCookie('species'));
    
    var species_id = getCookie('species');
    var species = polyclave_data.species['s'+ species_id];
    
    
    // basic info about the species
    if(species.images.length > 0){
        $('#profile-page .profile-image').attr('src','data/images/thumbsquared/species/' + species.id  + '/' +  species.images[0].filename );
    }else{
        $('#profile-page .profile-image').attr('src', null);
    }
    $('#profile-page .profile-title').html(species.title);
    $('#profile-page .profile-subtitle').html(species.subtitle);
    $('#profile-page .profile-notes').html(species.notes);
    
    // add in the characters
    var char_list = $('#profile-characters');
    
    // if we haven't got the characters loaded - load them up
    if(char_list.children().length == 0){
        
        // work through the groups
        for(var i = 0; i < polyclave_data.character_tree.length; i++){
        
            var group = polyclave_data.character_tree[i];
            
            var list_header = $('#profile-character-group-template').clone();
            list_header.html(group.title);
            list_header.attr('id', 'profile-character-group-' + group.id);
            char_list.append(list_header);
            
            // characters for this group
            for(var j = 0; j < group.characters.length; j++){
                
                var character = group.characters[j];
                
                var li = $('#profile-character-template').clone();
                li.find('h3').html(character.title);
                li.attr('id', 'profile-character-' + character.id);
                li.find('p').html('');
                li.find('p').hide();
                char_list.append(li);
                
            }
           
        }    
    }
    
    // character tree is now loaded so go through and add the scores for this species
    for(var i = 0; i < polyclave_data.character_tree.length; i++){
        var group = polyclave_data.character_tree[i];
        for(var j = 0; j < group.characters.length; j++){
            
            var character = group.characters[j];
            var lip = $('#profile-character-' + character.id + ' p');
            
            // clear out the old ones
            lip.empty();
            
            var count = 0;
            for(var k = 0; k < character.states.length; k++){
                var state = character.states[k];
                
                if($.inArray(state.id, species.scores) > -1){
                    if(count > 0 ) lip.append('<span class="polyclave-state-spacer"> | </span>');
                    lip.append('<span class="polyclave-state">' + state.title + '</span>');
                    count++;
                }
            }
            
            if(count > 0) lip.show();
            else lip.hide();
            
        } 
    }
    
    char_list.listview('refresh');
    
    console.log(species);
    
}

    
    function initFilterPage( pageId ){


        // set up the page for the first time add in the characters
        var char_list = $('#polyclave-filter-list');

        // if we haven't got the characters loaded - load them up
        if(char_list.children().length == 0){

            // work through the groups
            for(var i = 0; i < polyclave_data.character_tree.length; i++){
                var group = polyclave_data.character_tree[i];
                
                char_list.append('<li data-role="list-divider" >'+  group.title  +'</li>');

                // characters for this group
                for(var j = 0; j < group.characters.length; j++){
                    var character = group.characters[j];
                    
                    var a = $('<a></a>');
                    a.attr('href', '#score-page?character='+ character.id );
                    a.attr('data-transition', 'slide');
                    a.html(character.title);
                    
                    var p = $('<p></p>');
                    p.hide();
                    a.append(p);

                    var li = $('<li></li>');
                    li.attr('data-polyclave-filter-character', character.id);
                    li.addClass('polyclave-filter-character');
                    li.append(a);
                    
                    
                    char_list.append(li);
                    
                }

            }    
        
            char_list.listview('refresh');
        }
        
        // write in the current filter state
        for(var i = 0; i < polyclave_data.character_tree.length; i++){
            var group = polyclave_data.character_tree[i];
         
            // characters for this group
            for(var j = 0; j < group.characters.length; j++){
                var character = group.characters[j];
                
                var lip = $('#polyclave-filter-list li[data-polyclave-filter-character="' + character.id + '"] p');
                lip.html('');

                var count = 0;
                for (var s=0; s < character.states.length; s++) {
                    var state = character.states[s];
                    
                    if (stateIsOn(state.id)){
                        if(count > 0 ) lip.append('<span class="polyclave-state-spacer"> | </span>');
                        lip.append('<span class="polyclave-state">' + state.title + '</span>');
                        count++;
                    }
                };

                if(count> 0){
                    lip.show();
                }else{
                   lip.hide();  
                } 

            }
        
        }

    }
    
    function initScorePage(){
        
        console.log('initScorePage: ' + getCookie('character'));        
        
        // get the character by id
        var char_id = getCookie('character');
        var character = null;
        group_loop: 
        for(var g = 0; g < polyclave_data.character_tree.length; g++){
            var group = polyclave_data.character_tree[g];
            for(var c = 0; c < group.characters.length; c++){
                character = group.characters[c];
                if(character.id == char_id){
                    break group_loop;
                }
            }
        }
        
        console.log(character);
        
        // build a field set
       
        var field_set = $('#score-page fieldset');
        
        // remove the old ones
        field_set.find('.ui-checkbox').remove();
        field_set.find('legend').remove();
        
        
        field_set.controlgroup("refresh");
        
        field_set.append('<legend><h2>'+ character.title + '</h2></legend>');
        
        // write each state into the fieldset
        for (var i=0; i < character.states.length; i++) {
            var state = character.states[i];
            var name_id = 'checkbox_character_' + character.id + '_state_' + state.id;

            var label = $('<label></label>');
            label.html(state.title);
            console.log(field_set.controlgroup("container"));
            field_set.controlgroup("container").append(label);
            
            var input = $('<input></input>');
            input.attr('type', 'checkbox');
            input.attr('name', name_id);
            input.attr('id', name_id);
            input.attr('value', state.id);

            if(stateIsOn(state.id)){
                input.attr('checked', true);
            }else{
                input.attr('checked', false);
            }
                      
            input.change(function scoreChanged(e){
                var state_id = e.currentTarget.value;
                var on = e.currentTarget.checked;
                setCurrentState(state_id, on);                                
            });

            label.append(input);

        };
        
        field_set.enhanceWithin().controlgroup("refresh");
   
    }    
    
    function initSpeciesPage( pageId ){
        
        console.log("initSpeciesPage");
        
        //var page = $.mobile.pageContainer.pagecontainer("getActivePage");
        var start_index = 0;
        
         // if there is a current species set and haven't just updated the
         // scores then display the last species if possible
         var species_id = getCookie('species');  
         if(!polyclave_data.scores_changed && typeof species_id != "undefined"){
         
             console.log("we have a selected species = " + species_id);
             
             // is it already loaded in the document - this is probably the case
             var species_li = $( 'li[data-polyclave-species-id="s'+ species_id +'"]');
             if(species_li.length == 0){
                 
                 // if we don't then find where it comes in the order of things
                 // and start with it
                 for(var i = 0; i < polyclave_data.species_order.length; i++){
                     if(polyclave_data.species_order[i] == 's' + species_id){
                         start_index = i;
                     }
                 }

                 // if we are beyond the end of the list the back up a bit
                 if(polyclave_data.species_order.length - (start_index +1) < 30){
                     start_index = polyclave_data.species_order.length - 31;
                 }

                 console.log("start_index = " + start_index);
                 for(var i = start_index; i < start_index + 30; i++){
                      $("#polyclave-species-list").append(getSpeciesListItem(i));
                  }

             }// selected species not there so added

             // highlight the selected species - it will be there by now
             $('#polyclave-species-list li').removeClass('polyclave-current-species');
             
             $('#polyclave-species-list li[data-polyclave-species-id="s'+ species_id +'"]').addClass('polyclave-current-species');
             
         }else{
             //  we have no current species or the scores have changed
             // so just load the first 30 species - will stop automatically if not it runs off the end
             console.log("loading first thirty");
              
              // remove the existing ones
              $('#polyclave-species-list li').remove();
              
              // if the score has changed we should sort the list before display.
              if(polyclave_data.scores_changed){
                  sortSpeciesList();
              }
              
              for(var i = 0; i < 30; i++){
                  var li = getSpeciesListItem(i);
                  if(li != null){
                      $("#polyclave-species-list").append(li);
                  }
              }
         }
         
         $("#polyclave-species-list").listview("refresh");        

       
    }


/*
    ************ Utility Methods *************  
*/

function sortSpeciesList(){

    console.log('sortSpeciesList');

    console.log(polyclave_data.species_order);

    polyclave_data.species_order.sort(function(a, b){       
        var species_a = polyclave_data.species[a];
        var species_b = polyclave_data.species[b];
        
        // score descending
        if(species_a.score > species_b.score) return -1;
        if(species_a.score < species_b.score) return 1;
        
        // if they have the same score then do on natural ordering
        if(species_a.score == species_b.score){
            // sort order ascending
            if(species_a.sort_order < species_b.sort_order) return -1;
            if(species_a.sort_order > species_b.sort_order) return 1;
            if(species_a.sort_order == species_b.sort_order) return 0;
        } 
    
    });
    
    console.log(polyclave_data.species_order);

    // flag that list is now in sync with scores
    polyclave_data.scores_changed = false;

}


/* create scrollstop handler function */
function checkScroll() {
    
    polyclave_data.species_last_scroll = $(window).scrollTop();
    
    /* You always need this in order to target
       elements within active page */
    var activePage = $.mobile.pageContainer.pagecontainer("getActivePage");

    /* Viewport's height */
    var screenHeight = $.mobile.getScreenHeight();

    /* Content div - include padding too! */
    var contentHeight = $(".ui-content", activePage).outerHeight();

    /* Height of scrolled content (invisible) */
    var scrolled = $(window).scrollTop();

    /* Height of both Header & Footer and whether they are fixed
       If any of them is fixed, we will remove (1px)
       If not, outer height is what we need */
    var header = $(".ui-header", activePage).outerHeight() - 1;
    var footer = $(".ui-footer", activePage).outerHeight() - 1;

    /* Math 101 - Window's scrollTop should
       match content minus viewport plus toolbars */
    var scrollEnd = contentHeight - screenHeight + header + footer;

    /* if (pageX) is active and page's bottom or top is reached load more elements  */
    if (activePage[0].id == "species-page"){
        
        // are we at the top?
        if(scrolled == 0){
            adjustListTop(activePage);
        }
        
        // are we at the bottom?
        if (scrolled >= scrollEnd) {
            adjustListBottom(activePage);
        }
        
    }
}

function adjustListTop(page){
    
    // prevent double calling
    $(document).off("scrollstop");
    $.mobile.loading("show", {
      text: "loading more..",
      textVisible: true
    });
    
    setTimeout(function() {
        
        // get the id of the last child
        for(var i = 0; i < 5; i++){
            var first_child_index = parseInt($("li:first-child", page).attr('data-polyclave-species-index'));
            if(first_child_index > 0){
                var new_index = first_child_index - 1;
                $("#polyclave-species-list", page).prepend(getSpeciesListItem(new_index));
            }
        }

        $("#polyclave-species-list", page).listview("refresh");
        
        // if there are too many in the list knock some off the bottom.
        while($("li", page).length > 30){
           $("li:last-child", page).remove();
        }
        
        $.mobile.loading("hide");
        
        $(document).on("scrollstop", checkScroll);
        
      }, 500);
    
}

/* add more function */
function adjustListBottom(page) {
  $(document).off("scrollstop");
  $.mobile.loading("show", {
    text: "loading more..",
    textVisible: true
  });

  setTimeout(function() {
    
    // get the id of the last child
    for(var i = 0; i < 5; i++){
        var last_child_index = parseInt($("li:last-child", page).attr('data-polyclave-species-index'));
        if(last_child_index < polyclave_data.species_order.length -1){
            var new_index = last_child_index + 1;
            $("#polyclave-species-list", page).append(getSpeciesListItem(new_index));
        }
    }

    $("#polyclave-species-list", page).listview("refresh");
   
    // if there are too many in the list knock some off the top.
    while($("li", page).length > 30){
       $("li:first-child", page).remove();
    }
    
    $.mobile.loading("hide");
    
    $(document).on("scrollstop", checkScroll);

  }, 500);

}

function getSpeciesListItem(species_index){
    
    // do nothing if we are out of range
    if(species_index < 0) return null;
    if(species_index >= polyclave_data.species_order.length) return null;
        
    // get the species
    var species_id = polyclave_data.species_order[species_index];
    var species = polyclave_data.species[species_id];
    
    console.log(species);
    
    var out = '<li data-polyclave-species-index="' + species_index + '"  data-polyclave-species-id="' + species_id + '" >';
    out += '<a href="#profile-page?species=' + species.id + '" data-transition="slide">';
        
    if(species.images.length > 0){
        out += '<img src="data/images/thumbsquared/species/' + species.id  + '/' +  species.images[0].filename + '" />'
    }
    
    out += '<h3>' + species.title + '</h3>';
    out += '<p>' + species.subtitle + '</p>';

    species.score = parseInt(species.score) || 0; // check species.score has been initialised
    out += '<span class="ui-li-count">score: ' + species.score + '</span>';

    out += '</a>';
    out += '</li>';
    
    return out;
    
}


/* attach scrollstop for first time */
$(document).on("scrollstop", checkScroll);

function stateIsOn(state_id){
    var currentStates = getCurrentStates();
    if($.inArray(state_id.toString(), currentStates) != -1){
        return true;
    }else{
        return false;
    }
}

function setCurrentState(state_id, on){
        
    var currentStates = getCurrentStates();
    
    console.log(polyclave_data.character_tree[0]);

    if($.inArray(state_id, currentStates) != -1){
        
        // if it is in the array and shouldn't be
        if(!on){
            currentStates = jQuery.grep(currentStates, function(value) {
              return value != state_id;
            });
        }
        
    }else{
        // if it isn't in the array but should be
        if(on){
            currentStates.push(state_id);
        }
    }
    saveCurrentStates(currentStates);
    updateSpeciesScores(state_id, on);
    
}

function resetSpeciesScores(){
    for (var species_id in polyclave_data.species) {
        polyclave_data.species[species_id].score = 0;
    }
    polyclave_data.scores_changed = true;
}

function updateSpeciesScores(state_id, on){
    
    // run through the characters, states until we find that 
    // state then run through the species and either increment
    // or decrement their scores.
    character_group_loop:
    for (var g = 0; g < polyclave_data.character_tree.length; g++) {
        var group = polyclave_data.character_tree[g];
        for (var c = 0; c < group.characters.length; c++) {
            var character = group.characters[c];
            for (var s = 0; s < character.states.length; s++) {
                var state = character.states[s];
                if(state.id == state_id){
                    for (var sp = 0; sp < state.species.length; sp++) {
                        var species_id = state.species[sp];
                        var species = polyclave_data.species['s' + species_id];
                        
                        // check species.score has been initialised
                        species.score = parseInt(species.score) || 0;
                        
                        if(on){
                            species.score++;
                        }else{
                            species.score--;
                        }
                        
                        console.log(species.title + ": " + species.score);

                    };
                    break character_group_loop;
                }
            };
        };
    };
    
    // set a flag to say that the scores have been changed
    polyclave_data.scores_changed = true;
    
}

// get the current filter states
function getCurrentStates(){
    
    var currentStateString = getCookie('polyclave-states');
    if(currentStateString.length == 0){
        currentStates = [];
    }else{
        currentStates = JSON.parse(currentStateString);
    }
    
    return currentStates;
}

function saveCurrentStates(states){
    setCookie('polyclave-states', JSON.stringify(states), 365);
}
    
/*
    * The cookie methods actually uses local storage *
*/

function setCookie(name,value,exdays)
{
    localStorage.setItem(name, value);
}

function getCookie(name){
    
    var value = localStorage.getItem(name);
    if (value == null){
        value = '';
    }
    return value;
}

function deleteCookie(name) {
    localStorage.removeItem(name);
}    
    
