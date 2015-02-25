// config vars

var filtersCookieName = 'polyclave_filter_state';

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

// this is run with every page loaded - may be cached though?
$(document).bind('pageinit', function(e, data) {
    console.log("- pageinit -");
    
    // we need to clear the fiter 
    $('#filter-clear-button').click(function(){
         
         var newArray = [];
         setCookie(filtersCookieName,newArray.join(),365);
         document.location.reload();
         
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
            case 'profile-page':
                initProfilePage();
                break;
            case 'score':
                initScorePage( data.toPage.attr("id") );
                break;
            case 'filter':
                initFilterPage( data.toPage.attr("id") );
                break;
            case 'species':
                initSpeciesListPage( data.toPage.attr("id") );
                break;

            default:
                console.log("No init method for " + data.toPage.attr("id"));
        }
        
    
    }
    
    
});

   // Called after the page has become visible.
    $(document).bind( "pagechange", function( e, data ) {
        
        // this ensures the check boxes on the score pages are updated
        // could perhaps be run only with score pages for efficiency 
        // but no harm in making sure all checkboxes are up to date!
        $("input[type='checkbox']").checkboxradio("refresh");
        
        
    });


/* 
    Init the about page - may not do anything
*/
function initAboutPage(){
    console.log('initAboutPage');
    $('#about-page-subtitle').html( polyclave_data.created );
}

function initProfilePage(){
    console.log('initProfilePage: ' + getCookie('species'));
    
    
    var species_id = getCookie('species');
    var species = polyclave_data.species['s'+ species_id];
    
    // basic info about the species
    // fixme - thumbnail here?
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

    /*
        Init the score page so by popul
    */
    function initScorePage(pageId){
        
        console.log("Init: " + pageId);
        
        var inputSelector = "#" + pageId + " .stateCheck";
        
        // make sure we have a cookie of some kind for the states
        if(getCookie(filtersCookieName) == null){
            setCookie(filtersCookieName, '' , 365);
        }else{
            var currentStates = getCookie(filtersCookieName).split(',');
        }
        
        console.log(currentStates);
        
        // set the check boxes as per the values in the cookie
         $(inputSelector).each(function(index, input){
             
             for(var i = 0; i < currentStates.length; i++){
                 
                 if(currentStates[i] == input.value){
                     input.checked = true;
                     return;
                 }
             }
             
             // otherwise they are not checked
             input.checked = false;
         });
        
        
        //listen to clicking and unclicking of checkboxes
        $(inputSelector).change(function(e){
            
            var currentStates = getCookie(filtersCookieName).split(',');
            var changedState = e.currentTarget.value
            
            if(e.currentTarget.checked){
                
                console.log("Add " + changedState); 
                currentStates[currentStates.length] = e.currentTarget.value;
                setCookie(filtersCookieName,currentStates.join(),365);
                
            }else{
                console.log("Remove " + changedState);
                var newArray = [];
                for(var i = 0; i < currentStates.length; i++){
                    if(currentStates[i] != changedState) newArray[newArray.length] = currentStates[i];
                }
                setCookie(filtersCookieName,newArray.join(),365);
                
            }
                       
        });
        
    }
    
    
    function initFilterPage( pageId ){

        var filtersCookieName = 'mobile_guide_states';
        var currentStates = getCookie(filtersCookieName).split(',');
        
        console.log(currentStates);
        
        // we update the page in response to getting
        // the
        
        $(".filterState").each(function(index, span){

            $('#' + span.id).css('display', 'none');
      
            for(var i = 0; i < currentStates.length; i++){
              
              if('filterState-' + currentStates[i] == span.id){
                  $('#' + span.id).css('display', 'inline');
                  return;
              }
              
            }
                      
        });


    }
    
    
    function initSpeciesListPage( pageId ){
        
        // we need the current states
        var filtersCookieName = 'mobile_guide_states';
        var currentStates = getCookie(filtersCookieName).split(',');
        
        // set the score to - while we load the new ones
        $('#species-page .ui-li-count').html('Score: - ');
        
        var scoreMatrix = [];
        
        // call the ajax for a list of all scores
        $.getJSON('js/scores_data.js', function(data) {
         
          // work through the items in the
          var currentSpecies = null;
          $.each(data, function(index, row){
            
            // make sure we are on the right species
            // they are sorted so come in blocks
            if (currentSpecies == null || currentSpecies.speciesId != row.species_id){
                currentSpecies = {speciesId:row.species_id, score:0};
                scoreMatrix[currentSpecies.speciesId] = currentSpecies;
            }
                        
            // is this state one of the ones that has been selected
            for(var i = 0; i < currentStates.length; i++){
                if(row.state_id == currentStates[i]){
                    currentSpecies.score = currentSpecies.score + 1;
                    break;
                }
            }  
          });
          
          // we now have a matrix of species scores
          // let's update the display
           $('#species-page .ui-li-count').each(function(index, span){
               
               var spanId =  span.id.substring(14);
               currentSpecies = scoreMatrix[spanId];
               
               if(spanId in scoreMatrix){
                   span.innerHTML = 'Score: ' + currentSpecies.score;
                   
                   $('#'+span.id).data('score', currentSpecies.score);
                   
               }else{
                   span.innerHTML = 'Score: 0';
                   $('#'+span.id).data('score', 0);
                    
               }
               
            });
            
            // now sort the list as per instructions..
            var mylist = $('#species-page ul');
            var listitems = mylist.children('li').get();
            listitems.sort(function(a, b) {
                
               var elementA = $(a).find('.ui-li-count');
               var scoreA = elementA.data('score');
               
               var elementB = $(b).find('.ui-li-count');
               var scoreB = elementB.data('score');
               
               if(scoreA == scoreB) return 0;
               if(scoreA > scoreB) return -1;
               if(scoreA < scoreB) return 1;
            
            })
            //$('#species-page ul').empty();
            $.each(listitems, function(idx, itm) { 
                mylist.append(itm);
               
            });
            
            

          
        });
        
        
       
    }

    
    /*
        ************ Utility Methods *************
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
    
    /*
    function setCookie(c_name,value,exdays)
    {
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
    }

    function getCookie(c_name){
    var i,x,y,ARRcookies=document.cookie.split(";");
    for (i=0;i<ARRcookies.length;i++)
    {
      x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
      y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
      x=x.replace(/^\s+|\s+$/g,"");
      if (x==c_name)
        {
        return unescape(y);
        }
      }
     return '';
    }

    function deleteCookie(name) {
        setCookie(name,"",-1);
    }
*/