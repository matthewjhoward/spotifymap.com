import React, { Component } from 'react';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import spotify_data from '../../../../data/charts-data'
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";
import s from './am4chartMap.module.scss';
import LayoutContext from '../../../../components/Layout/LayoutContext';


import {getFlag} from '../../../../helpers';

class Am4chartMap extends Component {
  static contextType = LayoutContext;
  constructor(props){
    super(props);
    this.state = {
      country: 'Global (inner)',
      
    }
    this.propTriggered = false;
    am4core.options.queue = true;
    am4core.options.onlyShowOnViewport = true;
    // am4core.options.minPolylineStep = 5;
    

    this.componentDidMount = this.componentDidMount.bind(this);
  }

  

  updateData(){
    var countryData = spotify_data[this.currentID];
    var dateData = undefined;
    // console.log(countryData);
    if(countryData !== undefined){
      dateData = countryData[this.currentDate];
    }
    if(dateData !== undefined){
      dateData['country']=this.currentCountry;
    }else{
      dateData = {'country': this.currentCountry, 'track_id': undefined, 'v_track_id': undefined};
    }
    dateData['countryID'] = this.currentID;
    dateData['country'] = getFlag(this.currentID) + ' ' + dateData['country'];
    this.props.setCountryData(dateData);
  }

  


  componentDidMount() {

    

    this.currentPolygon = undefined;
    this.currentCountry = 'Global';
    this.currentID = 'GLOBAL';
    this.currentDate = this.props.date;
    console.log(this.currentID);
    console.log(this.currentDate);

    this.updateData();
    // this.props.setCountryData(spotify_data[this.currentID][this.currentDate])

    am4core.useTheme(am4themes_animated);
    let container = am4core.create("map", am4core.Container);
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);

    // container.preloader.disabled = true;
    
    let validIDs = Object.keys(spotify_data);

    let bubbleData = []
    for (var i=0; i<validIDs.length; i++){
      var theId = validIDs[i];
      if (theId !== 'GLOBAL'){
        let data = {"id": theId, flag: getFlag(theId)};
        bubbleData.push(data);
      }
      
    }
    

    
    let map = container.createChild(am4maps.MapChart);
    // // map.hide(0)
    // map.events.onAll((ev) => {
    //   if (ev !== "propertychanged") {
    //     console.log(ev);
    //     console.timeEnd("chart");
    //     console.time("chart");
    //     // if(ev === "validated"){
    //     //   map.show(0);
    //     // }
    //     // if(ev === "beforedatavalidated"){
    //     //   map.hide(0);
    //     // }
    //   }
    // });
    map.geodata = am4geodata_worldLow;
    map.percentHeight = 90;
    map.dy = 10;
    map.projection = new am4maps.projections.Miller();
    map.homeZoomLevel = 1;

    
    let shadowPolygonSeries = map.series.push(new am4maps.MapPolygonSeries());
    
    let polygonSeries = map.series.push(new am4maps.MapPolygonSeries());
    let imageSeries = map.series.push(new am4maps.MapImageSeries());
    

    map.zoomControl = new am4maps.ZoomControl();
    map.zoomControl.layout = 'horizontal';
    map.zoomControl.align = 'left';
    map.zoomControl.valign = 'bottom';
    map.zoomControl.dy = -10;
    map.zoomControl.contentHeight = 20;
    map.zoomControl.minusButton.background.fill = am4core.color("#C7D0FF");
    map.zoomControl.minusButton.background.stroke = am4core.color("#6979C9");
    map.zoomControl.minusButton.label.fontWeight = 600;
    map.zoomControl.minusButton.label.fontSize = 22;
    map.zoomControl.minusButton.scale = .75;
    map.zoomControl.minusButton.label.scale = .75;
    map.zoomControl.plusButton.background.fill = am4core.color("#C7D0FF");
    map.zoomControl.plusButton.background.stroke = am4core.color("#6979C9");
    map.zoomControl.plusButton.label.fontWeight = 600;
    map.zoomControl.plusButton.label.fontSize = 22;
    map.zoomControl.plusButton.label.align = "center";
    map.zoomControl.plusButton.scale = .75;
    map.zoomControl.plusButton.label.scale = .75;
    map.zoomControl.plusButton.dx = 5;
    map.zoomControl.minusButton.events.on("hit", (ev) =>{
      showWorld(this, false);
    });
    map.homeGeoPoint = { longitude: 11, latitude: 30 };
    map.deltaLongitude = -10;
    map.backgroundSeries.events.on("hit", (ev) =>{
      showWorld(this, true);
      this.updateData();
    });

    // map.backgroundSeries.events.on("drag", (ev) => {
    //   polygonSeries.mapPolygons.each(function (polygon) {
    //     var id = polygon.dataItem.id;
    //     var image = imageSeries.getImageById(id);
    //     image.tooltip.hide(0);
    //   })
    // });
    map.zoomEasing = am4core.ease.sinOut;


    let shuffleButton = map.zoomControl.createChild(am4core.Button);
    shuffleButton.contentHeight = 20;
    shuffleButton.background.fill = am4core.color("#C7D0FF");
    shuffleButton.background.stroke = am4core.color("#6979C9");
    shuffleButton.scale = 0.75;
    shuffleButton.label.scale = 0.75;
    shuffleButton.label.align = "center";
    shuffleButton.label.html = `<i class="fa fa-random" aria-hidden="true"></i>&nbsp;`;
    shuffleButton.label.tooltipText = "Random Region";
    shuffleButton.dx = 20;
    shuffleButton.dy = -6;
    shuffleButton.events.on("hit", (ev) => {
        var keys = [...validIDs];
        //Drop the current item or you get stuck shuffling to the same spot
        if(keys.includes(this.currentID)){
          keys.splice(keys.indexOf(this.currentID), 1);
        }
        
        var rand_country = keys[ keys.length * Math.random() << 0]
        if(rand_country === 'GLOBAL'){
          map.backgroundSeries.dispatchImmediately("hit");
        }else{
          let poly = polygonSeries.getPolygonById(rand_country);
          poly.dispatchImmediately("hit");
        }
        
    });
    

    let plusButtonHoverState = map.zoomControl.plusButton.background.states.create("hover");
    plusButtonHoverState.properties.fill = am4core.color("#354D84");
    let minusButtonHoverState = map.zoomControl.minusButton.background.states.create("hover");
    minusButtonHoverState.properties.fill = am4core.color("#354D84");

    let shuffleButtonHoverState = shuffleButton.background.states.create("hover");
    shuffleButtonHoverState.properties.fill = am4core.color("#354D84");
    


    //BACKGROUND SHADOWS 
    shadowPolygonSeries.geodata = map.geodata;
    shadowPolygonSeries.useGeodata = true;
    shadowPolygonSeries.dx = 3;
    shadowPolygonSeries.dy = 3;
    shadowPolygonSeries.mapPolygons.template.fill = am4core.color("#000");
    shadowPolygonSeries.mapPolygons.template.fillOpacity = 1;
    shadowPolygonSeries.mapPolygons.template.strokeOpacity = 0;
    shadowPolygonSeries.fillOpacity = 0.9;
    shadowPolygonSeries.fill = am4core.color("#000");
    shadowPolygonSeries.exclude = ['AQ'];
    shadowPolygonSeries.interactionsEnabled = false;

    //POLYGONS WITHOUT DATA
    let ignorePolygonSeries = map.series.push(new am4maps.MapPolygonSeries());
    ignorePolygonSeries.geodata = map.geodata;
    ignorePolygonSeries.useGeodata = true;
    ignorePolygonSeries.interactionsEnabled = true;
    ignorePolygonSeries.calculateVisualCenter = true;
    ignorePolygonSeries.mapPolygons.template.tooltipPosition = "fixed";
    ignorePolygonSeries.mapPolygons.template.fill = am4core.color("#1e2128");
    ignorePolygonSeries.mapPolygons.template.fillOpacity = 1;
    ignorePolygonSeries.mapPolygons.template.stroke = am4core.color("#6979C9");
    ignorePolygonSeries.mapPolygons.template.strokeWidth = 0.35;
    ignorePolygonSeries.tooltip.background.strokeWidth = 0;
    ignorePolygonSeries.mapPolygons.template.tooltipHTML = `<strong>{name}</strong><br> <small>No Data &#128546;</small>`
    ignorePolygonSeries.exclude = ['AQ'].concat(validIDs);

    
    

    polygonSeries.useGeodata = true;
 
    polygonSeries.dataFields.id = "id";
    
    polygonSeries.include=[...validIDs];
    polygonSeries.calculateVisualCenter = true;
    polygonSeries.data = JSON.parse(JSON.stringify(bubbleData));



    



    let polygonTemplate = polygonSeries.mapPolygons.template;
    // polygonTemplate.alwaysShowTooltip = true;

    
    polygonTemplate.fill = am4core.color("#1e2128"); 
    
    polygonTemplate.stroke = am4core.color("#6979C9")
    polygonTemplate.strokeWidth = 0.35;
    polygonTemplate.setStateOnChildren = true;
    




    //SEND DASHBOARD COUNTRY INFO ON CLICK
    polygonTemplate.events.on("hit", (ev) => {
      let mapPolygon = ev.target;
      // console.log(mapPolygon);
      handleCountryHit(this, mapPolygon);
      
      this.updateData();
    } );

    polygonTemplate.events.on("over", (ev) => {
      var mapPolygon = ev.target;
      rollOverCountry(mapPolygon);
    });


    polygonTemplate.events.on("out", (ev) => {
      var mapPolygon = ev.target;
      rollOutCountry(mapPolygon);
    });

    // polygonTemplate.events.on("over", (ev) => {
    //    var circ = imageSeries.getImageById(ev.target.dataItem.id);
    //    animateBullet(circ);
    // });


    let polygonHoverState = polygonTemplate.states.create("hover");
    polygonHoverState.properties.fill = am4core.color("#1DB954");

    let ignoreHoverState = ignorePolygonSeries.mapPolygons.template.states.create("hover");
    // ignoreHoverState.properties.fillOpacity = 0.9;
    ignoreHoverState.properties.fill = am4core.color("black");

    let polygonActiveState = polygonTemplate.states.create("active")
    polygonActiveState.properties.fill = am4core.color("#1DB954");
    // polygonActiveState.properties.showTooltipOn = 'active';



    

    
    imageSeries.data = JSON.parse(JSON.stringify(bubbleData));
    imageSeries.dataFields.id = "id";



    imageSeries.tooltip.showInViewport = false;
    imageSeries.tooltip.animationDuration = 0;//Makes tooltip stay with country
    // imageSeries.tooltip.transitionDuration = 0;
    imageSeries.tooltipPosition="fixed";
    imageSeries.tooltip.getFillFromObject = false;
    // imageSeries.tooltip.background.fill = am4core.color("#1870DC"); //blue
    imageSeries.tooltip.background.fill = am4core.color("black");
    imageSeries.tooltip.background.fillOpacity = 1;
    imageSeries.tooltip.background.strokeWidth = 0;

    imageSeries.tooltip.zindex = 10;
    

    var imageTemplate = imageSeries.mapImages.template;
    imageTemplate.tooltipText = "[bold]{name}[/]";
    
    imageTemplate.nonScaling = true;

    imageTemplate.events.on("hit", (ev) => {

      var poly = polygonSeries.getPolygonById(ev.target.dataItem.id)
      handleCountryHit(this, poly);
      
      this.updateData();
    } )

    imageTemplate.events.on("over", (ev) =>
    {
      var poly = polygonSeries.getPolygonById(ev.target.dataItem.id)
      rollOverCountry(poly);
    });

    imageTemplate.events.on("out", (ev) =>
    {
      var poly = polygonSeries.getPolygonById(ev.target.dataItem.id)
      rollOutCountry(poly);
    });

    
    
    // var imageHoverState = imageTemplate.states.create("hover");

    // imageSeries.data = JSON.parse(JSON.stringify(bubbleData));
    // imageSeries.data = polygonSeries.data;
    


    var circle = imageTemplate.createChild(am4core.Circle);
    circle.fill = am4core.color("#1870DC");
    circle.radius = 4;
    circle.hiddenState.properties.scale = 0.0001;
    circle.hiddenState.transitionDuration = 2000;
    circle.defaultState.transitionDuration = 2000;
    circle.defaultState.transitionEasing = am4core.ease.elasticOut;
    circle.applyOnClones = true;


    imageTemplate.adapter.add("tooltipY", function (tooltipY, target) {
      return -target.children.getIndex(0).radius;
    })

    



    // function animateBullet(circle) {
    //   var animation = circle.animate([{ property: "scale", from: 1, to: 5 }, { property: "opacity", from: 1, to: 0 }], 1000, am4core.ease.circleOut);
    //   animation.events.on("animationended", function(event){
    //     animateBullet(event.target.object);
    //   })
    // }

   // this places bubbles at the visual center of a country
   imageTemplate.adapter.add("latitude", function (latitude, target) {
    var polygon = polygonSeries.getPolygonById(target.dataItem.id);
    if (polygon) {
      target.disabled = false;
      return polygon.visualLatitude;
    }
    else {
      target.disabled = true;
    }
    return latitude;
  })

  imageTemplate.adapter.add("longitude", function (longitude, target) {
    var polygon = polygonSeries.getPolygonById(target.dataItem.id);
    if (polygon) {
      target.disabled = false;
      return polygon.visualLongitude;
    }
    else {
      target.disabled = true;
    }
    return longitude;
  })



    
    imageSeries.invalidateRawData();
    
    this.map = map;
    this.polygonSeries = polygonSeries;

    

    


    function showWorld(caller, shouldClear){
      if(shouldClear){
        clearSelected();
      }
      caller.currentPolygon = undefined;
      caller.currentCountry = 'Global'
      caller.currentID = 'GLOBAL';
      // shadowPolygonSeries.show(500);
      map.goHome();
      // map.goHome(0);
    }
    function clearSelected(){
      polygonSeries.mapPolygons.each(function (polygon) {
        polygon.isActive = false;
        var id = polygon.dataItem.id;
        var image = imageSeries.getImageById(id);
        image.showTooltipOn = "hover";
        image.tooltip.hide(0);
      })
    }
    function handleCountryHit(caller, mapPolygon){

        if(caller.currentPolygon === mapPolygon && !caller.propTriggered){
          caller.currentPolygon.isActive = false;
          
          showWorld(caller, true);
          return;
        }
        caller.currentPolygon = mapPolygon;
        caller.currentID = mapPolygon.dataItem.dataContext.id;
        caller.currentCountry = mapPolygon.dataItem.dataContext.name;
        
        clearSelected();
        mapPolygon.isActive=true;
        
        // shadowPolygonSeries.hide(500);
        map.zoomToMapObject(mapPolygon, getZoomLevel(mapPolygon));
        // let z = getZoomLevel(mapPolygon);
        // let p = am4maps.pointToGeo([mapPolygon.latitude, mapPolygon.longitude])
        // let p = new am4core.IGeoPoint()
        // map.zoomToMapObject(mapPolygon, z,true ,0);
        // console.log(mapPolygon);
        // map.zoomToGeoPoint(p,z, true, 0)
        
        // map.polygon

        
    }

      // calculate zoom level (default is too close)
    function getZoomLevel(mapPolygon) {
      var w = mapPolygon.polygon.bbox.width;
      var h = mapPolygon.polygon.bbox.width;
      var scale = 3;
      // change 2 to smaller walue for a more close zoom
      return Math.min(map.seriesWidth / (w * scale), map.seriesHeight / (h * scale))
    }

    function rollOverCountry(mapPolygon){
      resetHover();
      
      if(mapPolygon){
        var id = mapPolygon.dataItem.id;
        mapPolygon.isHover = true;
        var image = imageSeries.getImageById(id);
        if(image){
          if (!image.dataItem.dataContext.name){
            image.dataItem.dataContext.name = mapPolygon.dataItem.dataContext.flag + " " + mapPolygon.dataItem.dataContext.name;

          }

          image.isHover = true;
          
          

        }
      }
    }
    function rollOutCountry(mapPolygon){
      
      var image = imageSeries.getImageById(mapPolygon.dataItem.id);
      resetHover();
      if(image){
        image.isHover = false;
      }
    }

    function resetHover() {
      polygonSeries.mapPolygons.each(function (polygon) {
        polygon.isHover = false;
      })
  
      imageSeries.mapImages.each(function (image) {
        image.isHover = false;
      })
    }

  }

  componentDidUpdate(oldProps){

    this.currentDate = this.props.date;
    this.currentID = this.props.countryID;

    if (oldProps.date !== this.props.date){
      this.updateData();
    }
    else if (oldProps.countryID !== this.props.countryID){

      if(this.currentID !== 'GLOBAL'){
        //toggle propTriggered to ensure we don't double hit when context is updated in Dashboard parent due to call to updateData() on hit
        this.propTriggered=true;
        let poly = this.polygonSeries.getPolygonById(this.currentID);
        poly.dispatchImmediately("hit");
        this.propTriggered = false;
        
      }else{
        this.map.backgroundSeries.dispatchImmediately("hit");
        
      }

    }

  }

  componentWillUnmount() {
    if(this.map) {
      this.map.dispose();
    }
  }

  render() {
    return (
      <div className={s.mapChart}>
        
        <div className={s.map} id="map">
          <span>Alternative content for the map</span>
        </div>
      </div>
    );
  }
}

export default Am4chartMap;
