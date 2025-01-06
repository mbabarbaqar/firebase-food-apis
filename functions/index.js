/**
* 
* Food facs API Class
* 
*/
class FoodfactApi{
	/**
	* Set country and language for base API path 
	*/
  	constructor(country) {
	 	this.country = country;
    	this.language = "en";  		
  	}
  	
  	/**
	* get main url
	* @type:cgi, api, base
	*/
  	getUrl(event, type, country_code = ''){
  		var endpint = "";
  		if(type == "api"){
			endpint = `api/v0/${event}`;
		}else if(type == "cgi"){
			endpint = `cgi/${event}`;
		}else if(type == "base"){
			endpint = `${event}`;
		}
		var country = `${this.country}`;
		if(country_code && country_code != ''){
			country = `${country_code}`;
		}
		const thisUrl = `https://${country}-en.openfoodfacts.org/${endpint}`;
		return thisUrl;
	}
	
	searchCategories(text){
		var params = [];
		var baseUrl = this.getUrl('suggest.pl', 'cgi');
		return baseUrl + "?tagtype=categories&string="+text;
	}
	
	getBrands(text){
		var baseUrl = this.getUrl('brands.json', 'base');;
		return baseUrl;
	}
	
	/**
	* get search url of foods api
	*/
	searchProductWithCatUrl(searchedParams){
		var params = this.searchParams();
		
		//Search by product name
		if(searchedParams.product_name && searchedParams.product_name != null){
			params.search_terms = searchedParams.product_name;
		}
		
		//Include category in search
		if(searchedParams.category_name && searchedParams.category_name != null){
			params.tagtype_0 = "categories";
			params.tag_contains_0 = "contains";
			params.tag_0 = searchedParams.category_name;
		}
		
		//Search by nutrition grade
		if(searchedParams.nutrition_grade && searchedParams.nutrition_grade != null){
			params.tagtype_1 = "nutrition_grades";
			params.tag_contains_1 = "contains";
			params.tag_1 = searchedParams.nutrition_grade;
		}
		
		//Add language 
		if(searchedParams.language_code && searchedParams.language_code != null){
			params.cl = searchedParams.language_code;
		}
		
		//Search by nutrition grade
		var countryCode = '';
		if(searchedParams.country_code && searchedParams.country_code != null){
			countryCode = searchedParams.country_code;
		}
		
		
		//Search by nutrition grade
		if(searchedParams.page && searchedParams.page != null){
			params.page = searchedParams.page;
		}
		
		//Define page size
		if(searchedParams.page_size && searchedParams.page_size != null){
			params.page_size = searchedParams.page_size;
		}
		
		
		
		params.fields = this.foodTypeFields();
		return this.getUrl('search.pl', 'cgi', countryCode) + this.processParams(params);
	}
	
	/**
	* get url of food item
	*/
	getFoodItem(code){
		var params = [];
		params.ln = this.language;
		params.fields = this.foodTypeFields();
		return this.getUrl('product/'+code+'.json', 'api') + this.processParams(params);
	}
	
	getCountriesUrl(){
		return "https://world.openfoodfacts.org/countries.json";
	}
	
	searchParams(){
		var params = {
			"ln" : this.language,
			"action" : "process",
			"json" : 1,
			"page_size" : 20,
			"page" : 1,
			/*"nutriment_0": "energy-kcal",
			"nutriment_compare_0": "gt",
			"nutriment_value_0": "0"*/
			
		};
		return params;
	}
	
	processParams(params){
		var paramsString = "";
		if(params){
			paramsString = "?";
			paramsString += Object.keys(params).map(function (key, index) {
			    return key+"="+params[key];
			}).join('&');
		}
		return paramsString;
	}
	
	// Return specific elements from API request
	foodTypeFields(){
		var requiredFields = [
			"code",
			"product_name",
			"product_name_en",
			"generic_name",
			"category_properties",
			"image_url",
			"image_thumb_url",
			"quantity",
			"categories",
			"nutrient_levels",
			"serving_quantity",
			"serving_size",
			"nutriments",
			"nutriscore_data",
		];
		return requiredFields;
	}
}

/**
* 
* Food Type Object
* 
*/
class FoodItem {
  	constructor(foodObject) {
  		if(foodObject.product){
			this.product = foodObject.product;
		}
		
  		var nutritions = {};
  		if(this.product && this.product.nutriments){
			nutritions = this.product.nutriments;
		}
  		
	  	this.product_id = '';
	  	this.product_name = '';
	  	this.sodium = 0;
	  	this.fat = 0;
	  	this.carbohydrates = 0;
	  	this.proteins = 0;
	  	this.calories = 0;
	  	
	  	//Product Info
	  	if(this.product.product_name){
			this.product_name = this.product.product_name;
		}
	  	if(this.product.code){
			this.product_id = this.product.code;
		}
	  	
	  	//Nutritions Elements
	  	if(nutritions.sodium_100g){
	    	this.sodium = Number(nutritions.sodium_100g);
		}
		if(nutritions.fat_100g){
	    	this.fat = Number(nutritions.fat_100g);
		}
		if(nutritions.carbohydrates_100g){
	    	this.carbohydrates = Number(nutritions.carbohydrates_100g);
		}
		if(nutritions.proteins_100g){
	    	this.proteins = Number(nutritions.proteins_100g);
		}
		if(nutritions['energy-kcal_100g'] != undefined){
	    	this.calories = Number(nutritions['energy-kcal_100g']);
		}
  	}
  	
  	/**
	* Get All nutrition values
	* @quantity: increase or decrease quantity
	*/
  	getNutriments(qant){
  		var quantity;
  		if(qant && qant > 1){
			quantity = qant;
		}
		var defaultNutrition = {
			"product_id" : this.product_id,
			"quantity" : (quantity) ? quantity : 1,
			"product_name" : this.product_name,
			"sodium" : (quantity) ? this.sodium * quantity : this.sodium,
			"fat" : (quantity) ? this.fat * quantity : this.fat,
			"carbohydrates" : (quantity) ? this.carbohydrates * quantity : this.carbohydrates,
			"proteins" : (quantity) ? this.proteins * quantity : this.proteins,
			"calories" : (quantity) ? this.calories * quantity : this.calories,
		};
		return defaultNutrition;
	}
	
	getProcustId(){
		return this.product.code;
	}
  
}

/**
* Firebase function
* Start firebase functions and routes
* 
*/

/**
* Prepare sum of all foods within a selected meal array
* @param {object} dataArrays
* 
* @return
*/
function prepareSum(dataArrays){
	var SumArr = [];
	if(dataArrays){
		var eachNut = {
			"calories" : 0,
			"carbohydrates" : 0,
			"fat" : 0,
			"proteins" : 0,
			"sodium" : 0
		};
		dataArrays.forEach(function(nutObject, key) {
			
			Object.keys(nutObject).forEach(function(Nutkey) {
				var Nutvalue = nutObject[Nutkey];
				if(Nutkey == "sodium"){
					eachNut.sodium += Number(Nutvalue);
				}else if(Nutkey == "fat"){
					eachNut.fat += Number(Nutvalue);
				}else if(Nutkey == "carbohydrates"){
					eachNut.carbohydrates += Number(Nutvalue);
				}else if(Nutkey == "proteins"){
					eachNut.proteins += Number(Nutvalue);
				}else if(Nutkey == "calories"){
					eachNut.calories += Number(Nutvalue);
				}
			});
		});
		//push
		SumArr.push(eachNut);
	}
	return SumArr;
}

/**
* Return sum of all meals selected in a specific date
* @param {object} ObjectMealsArr
* 
* @return
*/
function simplyfyObjectWithSum(ObjectMealsArr){
	var mealsData = {};
	if(ObjectMealsArr){
		//Meals
		Object.keys(ObjectMealsArr).forEach(function(mealKey) {
			var allMealsObjs = ObjectMealsArr[mealKey];
			if(allMealsObjs){
				var forTotalArr = [];
				Object.keys(allMealsObjs).forEach(function(key2) {
					forTotalArr.push(allMealsObjs[key2]);	
					
				});
			}
			var makeSumFromMultiple = prepareSum(forTotalArr);
			mealsData[mealKey] = makeSumFromMultiple[0];
		});
	}
	return mealsData;
}




// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

// Get the Database service for the default app
var defaultDatabase = admin.database();
var defaultFirestore = admin.firestore();
const https = require('https');



/**
* Initialize settings
*/

const foodAPI = new FoodfactApi("world");//world
const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

/**
* 
* Use Express.js for detailed APIs 
* 
*/
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: true }));


/**
* Routes
* Get Request Service
* 
*/

/**
* Fetch countries  list
*/
app.get('/countries', async (req, res) => {
	const countries = require('./countries.json');
  	res.status(200).send(countries);
});

/**
* Fetch languages and codes  list
*/
app.get('/languages', async (req, res) => {
	const languages = require('./languages.json');
  	res.status(200).send(languages);
});

/**
* Retrieve saved settings against devise id
* @device_id in url
*/
app.get('/configure_setting/:device_id', async (req, res) => {
	const deviceId = req.params.device_id;
	
	var starCountRef = await defaultDatabase.ref('settings/' + deviceId).get();
	res.send(starCountRef);
});

/**
* Save Settings with two parameters
* @name
* @country_code
* @language_code
* @device_id
*/
app.post('/save_setting', async (req, res) => {
	const params = req.body;
	const settingData = {
		name: params.name,
		country: params.country_code, 
		language: params.languade_code
	};
	if(!params.name || !params.country_code || !params.languade_code || !params.device_id){
		res.status(200).send({status: false, message: "Please check all parameters, {name, country_code, languade_code, device_id}."});
	}
	
  	// Push the new message into Firestore using the Firebase Admin SDK.
  	if(params.device_id){
  		//const writeResult = await defaultFirestore.collection('settings').doc(params.device_id).set(settingData); //Also add()
  		const writeResult = await defaultDatabase.ref('settings/' + params.device_id).set(settingData); //Also add()
	  	if(writeResult){
	  		res.status(200).send({status: true, message: "Your settings have saved."});
		}else{
			res.status(200).send({status: false, message: "Unable to save your settings."});
		}		
	}else{
		res.status(200).send({status: false, message: "Device id parameter {device_id} not found."});
	}
});

/**
* Search categories
* @text String
*/
app.post('/categories', async (req, res) => {
	const params = req.body;
	const url = foodAPI.searchCategories(params.text);
  	
  	var result = [];
  	https.get(url, (resp) => {
    	let data = '';
    	resp.on('data', (chunk) => { data += chunk; });
    	resp.on('end', () => {
	        result = JSON.parse(data);
	        res.send(result);
      });
    }).on("error", (err) => {
    	res.status(201).send(result);
    });
});

/**
* Get all brands list in your area
*/
app.post('/brands', async (req, res) => {
	const params = req.body;
	const url = foodAPI.getBrands(params.text);
  	
  	var result = [];
  	https.get(url, (resp) => {
    	let data = '';
    	resp.on('data', (chunk) => { data += chunk; });
    	resp.on('end', () => {
	        result = JSON.parse(data);
	        res.send(result);
      });
    }).on("error", (err) => {
    	res.status(201).send(result);
    });
});

/**
* Search Food Products
* @product_name
* @category_name
* @nutrition_grade: A, B, C, D, E
* @language_code: en, fr, ur
* @country_code: pk, uk, us, world
*/
 app.post('/search_food', async (req, res) => {
	const params = req.body;

	const url = foodAPI.searchProductWithCatUrl(params);
  	var result = [];
  	https.get(url, (resp) => {
    	let data = '';
    	resp.on('data', (chunk) => { data += chunk; });
    	resp.on('end', () => {
	        result = JSON.parse(data);
	        res.send(result);
      });
    }).on("error", (err) => {
    	res.status(201).send(result);
    });
});

/**
* Get product by barcode or id
*/
app.get('/get_api_product/:code', async (req, res) => {
	const code = req.params.code;
	const url = foodAPI.getFoodItem(code);
  	var result = [];
  	https.get(url, (resp) => {
    	let data = '';
    	resp.on('data', (chunk) => { data += chunk; });
    	resp.on('end', () => {
	        result = JSON.parse(data);
	        res.send(result);
      });
    }).on("error", (err) => {
    	res.status(201).send(result);
    });
	res.send(starCountRef);

});

/**
* Get product by barcode or id
* @device_id : unique id
* @quantity : greater then 1
* @meal_name : breakfast, dinner
* @date (optional): On which date you want to add the food item
*/
app.post('/add_food_item/:code', async (req, res) => {
	const code = req.params.code;
	const device_id = req.body.device_id;
	const meal_name = req.body.meal_name;
	const quantity = req.body.quantity;
	
	var dateString = Date.parse(new Date().toDateString());
	if(req.body.date){
		dateString =  Date.parse(req.body.date);
	}
	
	if(!device_id || !meal_name){
		res.status(200).send({status: false, message: "Please check all parameters, {device_id, meal_name}."});
	}
	
	const url = foodAPI.getFoodItem(code);
  	var result = [];
  	https.get(url, (resp) => {
    	let data = '';
    	resp.on('data', (chunk) => { data += chunk; });
    	resp.on('end', () => {
	        result = JSON.parse(data);
	        if(result.product){
		        const foodItem = new FoodItem(result);
		        const foodData = foodItem.getNutriments(quantity);
				const productId = foodItem.getProcustId();
				if(productId && foodData){
					//defaultDatabase.ref('food_nutritions/' + device_id + '/' + dateString).set({date_string: dateString}); //Also add()
					const writeResult = defaultDatabase.ref('food_nutritions/' + device_id + '/' + dateString + '/' + meal_name+ '/' + productId).set(foodData); //Also add()
		        	res.send(foodData);
				}else{
					res.send({status: false, message: "Unable to add this food."});
				}
			}
      });
    }).on("error", (err) => {
    	res.status(201).send(result);
    });

});

/**
* @device_id
*/
app.post('/get_food_items', async (req, res) => {
	var device_id;
	if(!req.body.device_id || req.body.device_id == ''){
		res.status(200).send({status: false, message: "Please check all parameters, {device_id}."});
	}else{
		device_id = req.body.device_id;
	}

	//Preparing  date
	var dateString = Date.parse(new Date().toDateString());
	if(req.body.date){
		dateString = Date.parse(req.body.date);
	}
	
	//const writeResult = await defaultDatabase.ref('food_nutritions/' + device_id + '/' + dateString).get(); //Also add()
	
	var starCountRef = await defaultDatabase.ref('food_nutritions/' + device_id + '/' + dateString);
	starCountRef.on('value', (snapshot) => {
	  	
	  	var dataMain = {};
	  		dataMain.total = {};
	  	var mealsData = [];
	  	var allNtsArray = [];
	  	snapshot.forEach(function(childSnapshot) {
		    // Meals
		    var key = childSnapshot.key;
		    var childData = childSnapshot.val();
		    // Nutritions
		    var nutritionsData = [];
		    if(childSnapshot.hasChildren()){
				
				Object.keys(childData).forEach(function(Nutkey) {
					var NutData = childData[Nutkey];
					//Single Nutrition
					nutritionsData.push(NutData);
				});
			}
			
			if(nutritionsData){
			    //Sum
			    var sumofNutr = prepareSum(nutritionsData);
				allNtsArray.push(sumofNutr[0]);
				//Push
				var newDadaModel = {};
					newDadaModel = {};
			    newDadaModel['name'] = key;
			    newDadaModel['total'] = sumofNutr[0];
			    newDadaModel['meal_items'] = nutritionsData;
			    
			    
			    //Main Array
			    mealsData.push(newDadaModel);				
			}

		});
		
		dataMain.meals = mealsData;
		if(allNtsArray){
			dataMain.total = {};
	  		var OverAllTotal = prepareSum(allNtsArray);
	  		if(OverAllTotal){
				dataMain.total = OverAllTotal[0];
			}
		}
	  	res.status(200).send(dataMain);
	});
});

/**
* Get product by barcode or id
*/
app.post('/food_reports', async (req, res) => {
	var device_id;
	if(!req.body.device_id || req.body.device_id == ''){
		res.status(200).send({status: false, message: "Please check all parameters, {device_id}."});
	}else{
		device_id = req.body.device_id;
	}
	
	var currentDate = new Date();
	currentDate.setDate(currentDate.getDate() - 7);
	
	//Preparing start date
	var	start_date = Date.parse(currentDate);
	
	if(req.body.start_date){
		start_date = Date.parse(req.body.start_date);
	}
	
	//Preparing end date
	var end_date = Date.parse(new Date().toDateString());
	if(req.body.end_date){
		end_date = Date.parse(req.body.end_date);
	}
	
	//const writeResult = await defaultDatabase.ref('food_nutritions/' + device_id).get(); //Also add()
	const starCountRef = await defaultDatabase.ref('food_nutritions/' + device_id); //Also add()
	starCountRef.on('value', (snapshot) => {
	  	
	  	var dataMain = {};
	  	dataMain.start_date = start_date;
	  	dataMain.end_date = end_date;
	  	//Filtered Data
	  	var FilteredRedords = [];
	  	var days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
		var types = ["calories","carbohydrates","fat","proteins","sodium"];
	  	var mealsTotal = {};
	  	var nutritionTotal = {};
	  	// dates
	  	//All gathered data
	  	snapshot.forEach(function(childSnapshot) {
		    var key = childSnapshot.key;
		    if(key >= start_date && key <= end_date){
		   		var childData = simplyfyObjectWithSum(childSnapshot.val());//
		   		
		   		var dailyMeals = {};
		   		
		   		//All meals against single date
		   		Object.keys(childData).forEach(function(mealKey) {
		   			dailyMeals[mealKey] = {};
		   			if(!mealsTotal[mealKey]){
			   			mealsTotal[mealKey] = {};
			   		}
			   		//Sub total
			   		//Nutrition types total against all meals
		   			types.forEach(function(typeValue){
			   			if(!mealsTotal[mealKey][typeValue]){
			   				mealsTotal[mealKey][typeValue] = (childData[mealKey][typeValue])? parseFloat(childData[mealKey][typeValue]) : 0;
						}else{
							mealsTotal[mealKey][typeValue] = mealsTotal[mealKey][typeValue] + ((childData[mealKey][typeValue])? parseFloat(childData[mealKey][typeValue]) : 0);
						}
						
						//Sub total
						//Daily Meals
						if(!dailyMeals[mealKey][typeValue]){
			   				dailyMeals[mealKey][typeValue] = (childData[mealKey][typeValue])? parseFloat(childData[mealKey][typeValue]) : 0;
						}else{
							dailyMeals[mealKey][typeValue] = dailyMeals[mealKey][typeValue] + ((childData[mealKey][typeValue])? parseFloat(childData[mealKey][typeValue]) : 0);
						}
						
						//Grand Total
						//Nutrition Total grand total
						if(!nutritionTotal[typeValue]){
							nutritionTotal[typeValue] = (childData[mealKey][typeValue])? parseFloat(childData[mealKey][typeValue]) : 0;
						}else{
							nutritionTotal[typeValue] = nutritionTotal[typeValue] + ((childData[mealKey][typeValue])? parseFloat(childData[mealKey][typeValue]) : 0);
						}
						
			   		});//types
			   		
					
				});//meals
				
				var makeDate = new Date(Number(key));
		   		var date = makeDate.getDate();
		   		var dayname =  days[makeDate.getDay()];
		   		var daysData = {
		   			"day" : dayname + " " + date,
		   			"meals_total" : dailyMeals,
		   		};
		   		FilteredRedords.push(daysData);
			}
		});
		
		//Calculating Average of all types
		var dailyAverage = {};
		types.forEach(function(typeValue){
			dailyAverage[typeValue] = nutritionTotal[typeValue] / FilteredRedords.length;
		});
		
		dataMain.nutritions_total = nutritionTotal;
		dataMain.nut_daily_average = dailyAverage;
		dataMain.meals_total = mealsTotal;
		dataMain.report_data = FilteredRedords;
		//dataMain.push(FilteredRedords);
		
			
		res.status(200).send(dataMain);
	});
	
	
	
	//res.status(200).send({status: false});
});


/**
* 
* All APIs List 
* 
*/
/**
* Get product by barcode or id
*/
app.get('/', async (req, res) => {
  	var result = [
  		{
  			"type" : "GET",
			"name" : "All Countries",
			"path" : "/countries",
			"params" : [],
		},
  		{
			"type" : "GET",
			"name" : "All Languages & codes",
			"path" : "/languages",
			"params" : [],
		},
  		{
			"type" : "POST",
			"name" : "Search Foods",
			"path" : "/search_food",
			"params" : {
				"product_name" : "OPTIONAL: Orange, Apple, candy, potato",
				"category_name" : "OPTIONAL: fruits, breakfast_cereals, vegetables",
				"nutrition_grade" : "OPTIONAL: A, B, C, D, E",
				"language_code" : "OPTIONAL: en, ur, fr",
				"page" : "OPTIONAL: by default is 1",
				"page_size" : "OPTIONAL: by default 20 items per page",
			}
		},
  		{
			"type" : "POST",
			"name" : "Add Food Item To the Database",
			"path" : "/add_food_item/(:code)",
			"params" : {
				"code" : "REQUIRED: Product code in the url, Example: get_api_product/3229820129488",
				"device_id" : "REQUIRED: a unique id of the user or device id like: 12345",
				"meal_name" : "REQUIRED: Breakfast, Lunch, Dinner, Snacks",
				"quantity" : "OPTIONAL: by default quentity is one",
				"date" : "OPTIONAL: by default is current date, you may specify other dates too",
			}
		},
  		{
			"type" : "GET",
			"name" : "Get food items and calculations",
			"path" : "/get_food_items",
			"params" : {
				"device_id" : "REQUIRED: a unique id of the user or device id like: 12345",
				"date" : "OPTIONAL: by default is current date, you may specify other dates too"
			},
		},
  		{
			"type" : "POST",
			"name" : "Food Reports from all the save records",
			"path" : "/food_reports",
			"params" : {
				"device_id" : "REQUIRED: a unique id of the user or device id like: 12345",
				"start_date" : "OPTIONAL: by default is seven days before date, you may specify other dates too",
				"end_date" : "OPTIONAL: by default is current date, you may specify other dates too",
			}
		},
  	];

	res.send(result);
});

 // Expose Express API as a single Cloud Function:
exports.foodapi = functions.https.onRequest(app);