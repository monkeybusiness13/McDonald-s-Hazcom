/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
initialize: function() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
},
    
    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
onDeviceReady: function() {
    this.receivedEvent('deviceready');
},
    
    // Update DOM on a Received Event
receivedEvent: function(id) {
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');
    
    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');
    
    console.log('Received Event: ' + id);
}
};


// create database if it doesn't exist - open db
var db = window.sqlitePlugin.openDatabase({
                                          name: 'mcdh_app.db',
                                          location: 'default',
                                          androidDatabaseProvider: 'system'
                                          });

//on device ready
document.addEventListener('deviceready', function() {
                          db.transaction(function(tx) {
                                         //  tx.executeSql('DROP TABLE mcdh_brands');
                                         // tx.executeSql('DROP TABLE mcdh_products)');
                                         //  tx.executeSql('DROP TABLE mcdh_store_info)');
                                         tx.executeSql('CREATE TABLE IF NOT EXISTS mcdh_store_info (activationCode VARCHAR PRIMARY KEY, longitude, latitude)');
                                         }, function(error) {
                                         console.log('Table Creation Transaction ERROR: ' + error.message);
                                         }, function() {
                                         //  alert('Tables were created.');
                                         });
                          
                          
                          
                          // check to see if activation code is set
                          db.transaction(function(tx) {
                                         tx.executeSql('SELECT activationCode FROM mcdh_store_info', [], function(tx, rs) {
                                                       if(rs){// code exists
                                                       
                                                       }
                                                       else{// code doesn't exist
                                                       var activationCode = rs.rows.item(0).activationCode;
                                                       // first time launch
                                                       var applaunchCount = window.localStorage.getItem('launchCount');
                                                       
                                                       // Check if count already exists or not
                                                       if(applaunchCount){// This is a second time launch, and count = applaunchCount
                                                       
                                                       }
                                                       else{// Local storage is not set, hence first time launch. set the local storage item
                                                       window.localStorage.setItem('launchCount',1);
                                                       
                                                       // create table table if it doesn't exist
                                                       db.transaction(function(tx) {
                                                                      tx.executeSql('CREATE TABLE IF NOT EXISTS mcdh_brands (id INTEGER PRIMARY KEY, brandName)');
                                                                      tx.executeSql('CREATE TABLE IF NOT EXISTS mcdh_products (id INTEGER PRIMARY KEY, brandId, productName, pdfLocation)');
                                                                      }, function(error) {
                                                                      console.log('Table Creation Transaction ERROR: ' + error.message);
                                                                      }, function() {
                                                                      console.log('Tables were created.');
                                                                      });
                                                       
                                                       populateDatabase(); // populate the database if not already
                                                       }
                                                       
                                                       activationCodePrompt();
                                                       }
                                                        /* db.transaction(function(tx) {
                                                        // tx.executeSql('DROP TABLE mcdh_brands');
                                                        //tx.executeSql('DROP TABLE mcdh_products)');
                                                        tx.executeSql('CREATE TABLE IF NOT EXISTS mcdh_brands (id INTEGER PRIMARY KEY, brandName)');
                                                        tx.executeSql('CREATE TABLE IF NOT EXISTS mcdh_products (id INTEGER PRIMARY KEY, brandId, productName, pdfLocation)');
                                                        }, function(error) {
                                                        console.log('Table Creation Transaction ERROR: ' + error.message);
                                                        }, function() {
                                                        console.log('Tables were created.');
                                                        });
                                                        
                                                        populateDatabase();*/
                                                        
                                                       
                                                       
                                                       
                                                       
                                                       populateBrandProductList();
                                                       },
                                                       function(tx, error) {
                                                       console.log('SELECT error: ' + error.message);
                                                       
                                                       });
                                         });
                          },true);


// show activation code prompt
function activationCodePrompt(){
    
    navigator.notification.prompt(
                                  'Enter the activation code you received through email. For more information visit mcdhazcom.com.',  // message
                                  onPrompt,                      // callback to invoke
                                  'Activate',                    // title
                                  ['Activate','Visit Site']      // buttonLabels
                                  );
}

// populate database
function populateDatabase(){
    $.ajax({
           type: "GET",
           url: "http://mcdhazcom.com/app/db-setup.php",
           dataType: 'json',
           crossDomain: true,
           success: function(data){
           $.each(data.brands, function(index, val) {
                  insertBrandsTbl(val.id, val.brandName);
                  });
           
           $.each(data.products, function(index, val) {
                  insertProductsTbl(val.id, val.brandId, val.productName, val.pdfLocation);
                  });
           
           },
           error: function (x) {
           console.log("error: " + x.responseText);
           }
           });
}

function insertBrandsTbl(id, brandName) {
    db.transaction(function(tx) {
                   tx.executeSql('INSERT OR REPLACE INTO mcdh_brands (id,brandName) VALUES ("' + id + '","' + brandName + '")');
                   }, function(error) {
                   console.log('Brand Transaction ERROR: ' + error.message);
                   }, function() {
                   console.log('Populated brands tbl okay.');
                   });
}

function insertProductsTbl(id, brandId, productName, pdfLocation) {
    var n = pdfLocation.lastIndexOf('/');
    var fileName = pdfLocation.substring(n + 1);
    
    var filePath = cordova.file.documentsDirectory + 'download/' + fileName;
    var fileTransfer = new window.FileTransfer();
    var uri = encodeURI(decodeURIComponent(pdfLocation));
    console.log('uri: ' + uri);
    console.log('pdf: ' + pdfLocation);
    // Downloading the file
    fileTransfer.download(uri, filePath,
                          function (entry) {
                          console.log('Successfully downloaded file, full path is ' + entry.fullPath);
                          console.log(entry);
                          db.transaction(function(tx) {
                                         tx.executeSql('INSERT OR REPLACE INTO mcdh_products (id, brandId, productName, pdfLocation) VALUES ("' + id + '", "' + brandId + '", "' + productName + '", "' + entry.fullPath + '")');
                                         }, function(error) {
                                         console.log('Product Transaction ERROR: ' + error.message);
                                         }, function() {
                                         console.log('Populated products tbl okay.');
                                         });
                          },
                          function (error) {
                          console.log('error');
                          console.log(error);
                          },
                          false
                          )
    
}

function downloadFile(pdfLocation, fileName){
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
                             //console.log('file system open: ' + fs.name);
                             fs.root.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
                                             console.log('fileEntry is file? ' + fileEntry.isFile.toString());
                                             var oReq = new XMLHttpRequest();
                                             // Make sure you add the domain name to the Content-Security-Policy <meta> element.
                                             oReq.open("GET", pdfLocation, true);
                                             // Define how you want the XHR data to come back
                                             oReq.responseType = "blob";
                                             oReq.onload = function (oEvent) {
                                             var blob = oReq.response; // Note: not oReq.responseText
                                             if (blob) {
                                             // Create a URL based on the blob, and set an <img> tag's src to it.
                                             var url = window.URL.createObjectURL(blob);
                                             var ref = cordova.InAppBrowser.open(url, '_blank', 'location=yes');
                                             var myCallback = function(event) { alert(event.url); }
                                             ref.addEventListener('loadstart', myCallback);
                                             ref.removeEventListener('loadstart', myCallback);
                                             
                                             } else console.error('we didnt get an XHR response!');
                                             };
                                             oReq.send(null);
                                             }, function (err) { console.error('error getting file! ' + err); });
                             }, function (err) { console.error('error getting persistent fs! ' + err); });
}


function onPrompt(results) {
    if(results.buttonIndex == 1){// 'Activate' button clicked
        /*
         var location = getPosition();
         
         */
        var longitude = 0;
        var latitude = 0;
        
        var activationCode = results.input1;
        
        if(!activationCode){// no input
            alert("MUST ENTER ACTIVATION CODE");
            //exitFromApp();
        }
        else{// activation code entered -- check to see if valid
            $.ajax({
                   type: "GET",
                   url: "http://mcdhazcom.com/app/activation-check.php",
                   dataType: 'json',
                   data: "activationCode=" + activationCode,
                   crossDomain: true,
                   success: function(data){
                   console.log(data);
                   if(data == 'ok'){// valid
                   // save activation code -- user can use app
                   saveActivationCodeToDevice(activationCode, longitude, latitude);
                   }
                   else{// invalid
                   navigator.notification.alert(
                                                'The activation code you have entered, ' + activationCode + ', is invalid. Please try again.',  // message
                                                activationCodePrompt,         // callback
                                                'Invalid Code',            // title
                                                'Try Again'                  // buttonName
                                                );
                   }
                   },
                   error: function (x) {
                   console.log("error: " + x.responseText);
                   }
                   });
            
        }
    }
    else if(results.buttonIndex == 2){// 'Visit Site' button clicked
        cordova.InAppBrowser.open('http://mcdhazcom.com', '_blank', 'location=yes');
    }
}

function getPosition() {
    var options = {
    enableHighAccuracy: true,
    maximumAge: 0
    }
    var watchID = navigator.geolocation.getCurrentPosition(onSuccess);
    
    
    var getPosition
    function onSuccess(position){
        getPosition = function(position){
            // do somethin with the position object afterwards
            return [position.coords.latitude, position.coords.longitude];
        }.bind(null, position);
    }
    
    
    /* function onSuccess(position) {
     /* alert('Latitude: '          + position.coords.latitude          + '\n' +
     'Longitude: '         + position.coords.longitude         + '\n' +
     'Altitude: '          + position.coords.altitude          + '\n' +
     'Accuracy: '          + position.coords.accuracy          + '\n' +
     'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
     'Heading: '           + position.coords.heading           + '\n' +
     'Speed: '             + position.coords.speed             + '\n' +
     'Timestamp: '         + position.timestamp                + '\n');*/
    /*   alert([position.coords.latitude, position.coords.longitude]);
     
     };
     */
    function onError(error) {
        alert("McDonald's Hazcom needs permission to use your location to activate the application. Please go to Settings > McDonald's Hazcom and allow the app to use your location. Thank you.");
    }
    
    console.log(getPosition);
}

function getUserPosition(callback) {
    function onSuccess(position) {
        callback(position);
    };
    navigator.geolocation.getCurrentPosition(onSuccess);
}

function populateBrandProductList(){
    var html = "";
    var brandName;
    var products;
    
    db.transaction(function(tx) {
                   tx.executeSql('SELECT b.brandName, p.productName, p.pdfLocation FROM mcdh_brands AS b JOIN mcdh_products AS p WHERE b.id=p.brandId ORDER BY b.brandName ASC', [], function(tx, rs) {
                                 brandName = rs.rows.item(0).brandName;
                                 
                                 html += '<div data-role="collapsible-set" data-filter="true" data-children="> div, > div div ul li" data-inset="true" id="collapsiblesetForFilterChildren" data-input="#searchForCollapsibleSetChildren">';
                                 html += '<div data-role="collapsible" data-filtertext="' + brandName + ' REPLACEME">';
                                 html += '<h3 class="accordionBrandName">' + brandName + '</h3>';
                                 html += '<ul data-role="listview" data-inset="false">';
                                 
                                 for (var i = 0; i < rs.rows.length; i++){
                                 if(rs.rows.item(i).brandName == brandName){// same brand as previous product
                                 html += '<li data-filtertext="' + rs.rows.item(i).productName + '"><button class="btnProductPdf" onclick="btnOpenProductPdf(\'' + rs.rows.item(i).pdfLocation + '\')">' + rs.rows.item(i).productName + '</button></li>';
                                 products += rs.rows.item(i).productName + ' ';
                                 }
                                 else{// new brand
                                 html += '</ul>';
                                 html += '</div>';
                                 
                                 html = html.replace('REPLACEME', products);
                                 
                                 html += '<div data-role="collapsible" data-filtertext="' + rs.rows.item(i).brandName + ' REPLACEME">';
                                 html += '<h3>' + rs.rows.item(i).brandName + '</h3>';
                                 html += '<ul data-role="listview" data-inset="false">';
                                 html += '<li data-filtertext="' + rs.rows.item(i).productName + '"><button class="btnProductPdf" onclick="btnOpenProductPdf(\'' + rs.rows.item(i).pdfLocation + '\')">' + rs.rows.item(i).productName + '</button></li>';
                                 products = rs.rows.item(i).productName + ' ';
                                 }
                                 brandName = rs.rows.item(i).brandName;
                                 }
                                 
                                 
                                 html += '</ul>';
                                 html += '</div>';
                                 
                                 
                                 /*
                                  html += "<div data-role='collapsible'>";
                                  html += "<h2>" + brandName + "</h2>";
                                  html += "<ul data-role='listview' data-filter='true' data-filter-theme='a' data-divider-theme='b'>";
                                  
                                  for (var i = 0; i < rs.rows.length; i++){
                                  if(rs.rows.item(i).brandName == brandName){
                                  html += '<li data-filtertext="' + rs.rows.item(i).productName + '"><button onclick="btnOpenProductPdf(\'' + rs.rows.item(i).pdfLocation + '\')">' + rs.rows.item(i).productName + '</button></li>';
                                  }
                                  else{
                                  html += "</ul>";
                                  html += "</div>";
                                  
                                  html += "<div data-role='collapsible'>";
                                  html += "<h2>" + rs.rows.item(i).brandName + "</h2>";
                                  html += "<ul data-role='listview' data-filter='true' data-filter-theme='a' data-divider-theme='b'>";
                                  html += '<li data-filtertext="' + rs.rows.item(i).productName + '"><button onclick="btnOpenProductPdf(\'' + rs.rows.item(i).pdfLocation + '\')">' + rs.rows.item(i).productName + '</button></li>';
                                  }
                                  
                                  
                                  
                                  
                                  brandName = rs.rows.item(i).brandName;
                                  }
                                  
                                  html += "</ul>";
                                  html += "</div>";*/
                                 
                                 $('#divBrandProductAccordion').html(html);
                                 },
                                 function(tx, error) {
                                 console.log('SELECT error: ' + error.message);
                                 });
                   });
}

function btnOpenProductPdf(path){
    /*var ref = cordova.InAppBrowser.open(cordova.file.documentsDirectory + path, '_blank', 'location=yes');
     var myCallback = function(event) { alert(event.url); }
     ref.addEventListener('loadstart', myCallback);
     ref.removeEventListener('loadstart', myCallback);*/
    
    
    /* generate pdf using url. */
    if(cordova.platformId === 'ios') {
        
        // To use window.resolveLocalFileSystemURL, we need this plugin https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/
        // You can add this by doing cordova plugin add cordova-plugin-file or
        // cordova plugin add https://github.com/apache/cordova-plugin-file
        window.resolveLocalFileSystemURL(cordova.file.applicationDirectory,
                                         (url) => {
                                         var file = cordova.file.documentsDirectory + path;
                                         
                                         pdf.fromURL(file, {
                                                     documentsize: 'a4',
                                                     landscape: 'portrait',
                                                     type: 'share'
                                                     })
                                         .then((stats)=> this.preparetogobackground )
                                         .catch((err)=> this.showerror)
                                         },
                                         (err) =>
                                         console.log('error', err, '  args ->', arguments)
                                         );
    }else {
        pdf.fromURL(param, {
                    documentsize: 'a4',
                    landscape: 'portrait',
                    type: 'share'
                    })
        .then((stats)=> this.preparetogobackground )
        .catch((err)=> this.showerror)
    }
}

function saveActivationCodeToDevice(activationCode, longitude, latitude){
    db.transaction(function(tx) {
                   tx.executeSql('CREATE TABLE IF NOT EXISTS mcdh_store_info (activationCode VARCHAR PRIMARY KEY, longitude, latitude)');
                   tx.executeSql('INSERT INTO mcdh_store_info (activationCode, longitude, latitude) VALUES ("' + activationCode + '","' + longitude + '","' + latitude + '")');
                   }, function(error) {
                   console.log('Saving activation code ERROR: ' + error.message);
                   }, function() {
                   console.log('Saved activation code.');
                   });
}

app.initialize();
