import React, { Component } from 'react';

/* Imports */
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import s from './StreamChart.module.scss';
import spotify_data from '../../../../data/charts-data'


class StreamChart extends Component {
    constructor(props){
      super(props);
      this.state = {
        
      }
      this.tracks = require('../../../../data/tracks.json');
      this.streamAverage = 0;
      // am4core.options.queue = true;
      // am4core.options.onlyShowOnViewport = true;
      
      const {detect} = require('detect-browser');
      this.browser = detect().name;
      this.componentDidMount = this.componentDidMount.bind(this);
    }
/* Chart code */
// Themes begin

    componentDidMount(){
        

        am4core.useTheme(am4themes_dark);
        am4core.useTheme(am4themes_animated);
        // Themes end

        // Create chart instance
        let chart = am4core.create("graph", am4charts.XYChart);
        
        // Add data
        chart.data = this.loadChartData(this.props.countryID);
        chart.numberFormatter.numberFormat = "#.0a";
        chart.numberFormatter.bigNumberPrefixes = [
          { "number": 1e+3, "suffix": "K" },
          { "number": 1e+6, "suffix": "M" },
          { "number": 1e+9, "suffix": "B" }
        ];
        // console.log(chart.data);

        // Create axes
        let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.dateFormatter.firstDayOfWeek = 5;//Friday
        dateAxis.renderer.minGridDistance = 50;
        dateAxis.groupData = true;
        dateAxis.tooltipDateFormat = "EEE, MMM dd";
        dateAxis.tooltip.background.fill = am4core.color("#1870DC");
        dateAxis.tooltip.background.strokeWidth = 0;
        dateAxis.tooltip.label.fill = am4core.color("white");
        

        dateAxis.renderer.labels.template.events.on("hit", function(ev) {
          var start = ev.target.dataItem.date;
          var end = new Date(start);
          end.setMonth(end.getMonth() + 1);
          dateAxis.zoomToDates(start, end);
        })
        dateAxis.renderer.grid.template.disabled=true;

        //HIGHLIGHT WEEKENDS
        dateAxis.events.on("datavalidated", highlightWeekends);
        
        function highlightWeekends(ev){
          let axis = ev.target;
          let  start = axis.positionToDate(0);
          let end = axis.positionToDate(1);
         
          // Get weekends
          var current = new Date(start);
          while (current < end) {
            // Get weekend start and end dates
            let weekendStart = getWeekend(current);
            let weekendEnd = new Date(weekendStart);
            weekendEnd.setDate(weekendEnd.getDate() + 2);
        
            // Create a range
            let range = axis.axisRanges.create();
            range.date = weekendStart;
            range.endDate = weekendEnd;
            range.axisFill.fill = am4core.color("#396478");
            range.axisFill.fillOpacity = 0.0;
            range.grid.strokeOpacity = 0;
        
            // Iterate
            current.setDate(current.getDate() + 7);
          }

         
          function getWeekend(date) {
            let lastday = date.getDate() - (date.getDay() || 7) + 6;//Sat-SUN
            // let lastday = date.getDate() - (date.getDay() || 7) + 5;//FRI -SAT
            let lastdate = new Date(date);
            lastdate.setDate(lastday);
            return lastdate;
          }
        }

        dateAxis.events.on("startchanged", dateAxisChanged);
        dateAxis.events.on("endchanged", dateAxisChanged);
        function dateAxisChanged(ev) {
          let axis = ev.target;
          let start = new Date(ev.target.minZoomed);
          let end = new Date(ev.target.maxZoomed);
          let delta = Math.ceil((end-start) / (1000 * 60 * 60 * 24));
          // console.log("New Delta:" + delta);
          if(delta < 100){
            axis.axisRanges.template.axisFill.fillOpacity=0.2;
            // console.log(axis.axisRanges);
          }else{
            axis.axisRanges.template.axisFill.fillOpacity=0;
          }
    
        }

        // dateAxis.tooltip.background.fill = am4core.color("#1e2128");
        // dateAxis.tooltip.background.fillOpacity = 0.6;


        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.tooltip.disabled=true;
        

        
        

        // Create series
        let series = chart.series.push(new am4charts.LineSeries());//Column to make a bar chart
        series.dataFields.valueY = "streams";
        series.groupFields.valueY = "open";
        series.tensionX = 0.77;


        series.connect = false;
        series.dataFields.dateX = "date";
        series.strokeWidth = 2;
        // series.stroke = am4core.color("#1870DC");
        series.minBulletDistance = 20;
        
        // series.tooltipText = "{valueY.formatNumber('#.##a')}";

        // series.tooltipHTML = `
        // <div class="row">
        // <div class="col-3">
        // <img width="48px" src="{img}" /> 
        // </div>

        // <div class="col-8 text-ellipsis ">
        
        // {artist} <br />
        // {track} <br />
        // {valueY.formatNumber('#.##a')} streams
        // </div>


        // </div>
        // `
        series.tooltip.label.padding(0,12,0,0);
        let tooltipClass = "tooltipCard ";
        if (this.browser === 'safari'){
          tooltipClass += "position-fixed";
        }
        series.tooltipHTML = `
        <div class="card ` + tooltipClass + ` p-0">
        <div class="row no-gutters p-0">
            <div class="col-auto pl-0 pr-2">
              <img src="{img}" height="56px" /> 
            </div>
            <div class="col text-ellipsis text-muted">
                <div class="card-block px-2">
                <p class="card-text text-ellipsis py-0">
                {track}<br />
                {artist} <br />
                <span class="text-success">{valueY.formatNumber('#.##a')} streams</span>
                </p>
                
                </div>
            </div>
        </div>

    </div>
    `
        
        series.tooltip.pointerOrientation = "vertical";
        series.tooltip.background.strokeWidth = 0;
        series.tooltip.background.fillOpacity = 0;
        


        
        series.fill = am4core.color("#000");
        series.fillOpacity = 1;


        // let info = chart.plotContainer.createChild(am4core.Container);
        // info.width = 250;
        // info.height = 64;
        // info.x = 10;
        // info.y = 10;
        // info.background.fill = am4core.color("#000");
        // info.layout = "grid";

        // let imageLabel = info.createChild(am4core.Label);


    // function updateImageLabel(dataItem){
    //   imageLabel.dataItem = dataItem;
    //   // imageLabel.dataItem.img = dataItem.dataContext.img;
    //   // imageLabel.dataItem.track = dataItem.dataContext.track;
    //   // imageLabel.dataItem.artist = dataItem.dataContext.artist;
    //   // imageLabel.dataItem.valueY = dataItem.dataContext.valueY;

    //   imageLabel.html = `
    //     <div class="card tooltipCard p-0">
    //     <div class="row no-gutters p-0">
    //         <div class="col-auto pl-0 pr-2">
    //           <img src="{img}" height="56px" /> 
    //         </div>
    //         <div class="col text-ellipsis text-muted">
    //             <div class="card-block px-2">
    //             <p class="card-text text-ellipsis py-0">
    //             {track}<br />
    //             {artist} <br />
    //             <span class="text-success">{valueY.formatNumber('#.##a')} streams</span>
    //             </p>
                
    //             </div>
    //         </div>
    //     </div>

    // </div>
    // `
    // }

   


        // series.propertyFields.stroke = "color";
        // series.propertyFields.strokeDasharray = "color";

        let bullet = series.bullets.push(new am4core.Circle());
        bullet.radius = 5;

        

        let fillModifier = new am4core.LinearGradientModifier();
        fillModifier.opacities = [1, 0];
        fillModifier.offsets = [0, 1];
        fillModifier.gradient.rotation = 90;
        series.segments.template.fillModifier = fillModifier;

        // Add scrollbar with chart preview
        chart.scrollbarX = new am4charts.XYChartScrollbar();
        chart.scrollbarX.series.push(series);
        chart.scrollbarX.parent = chart.bottomAxesContainer;
        
        
        let scrollSeries1 = chart.scrollbarX.scrollbarChart.series.getIndex(0);
        let scrollAxis = chart.scrollbarX.scrollbarChart.xAxes.getIndex(0);
        scrollSeries1.strokeWidth = 1;
        scrollAxis.renderer.labels.template.stroke = am4core.color("white");

        function customizeGrip(grip){
          grip.icon.disabled=true;
          grip.background.fill = am4core.color("#1870DC");
          let hoverState = grip.background.states.create('hover');
          hoverState.properties.fill = am4core.color("#1DB954");
          let activeState = grip.background.states.create('down');
          activeState.properties.fill = am4core.color("#1DB954");
          
        }
        //Make grips tiny circles instead of default

        customizeGrip(chart.scrollbarX.startGrip);
        customizeGrip(chart.scrollbarX.endGrip);
        // console.log(chart.scrollbarX.startGrip);
        
        chart.scrollbarX.thumb.background.stroke=am4core.color("#1870DC");

        // chart.scrollbarX.background.fill = am4core.color('#040620');
        chart.scrollbarX.background.fill = am4core.color('#000');
        chart.scrollbarX.background.fillOpacity = 0.24

        chart.scrollbarX.thumb.background.fill = am4core.color('#040620');


        chart.scrollbarX.unselectedOverlay.fill = am4core.color('#040620');
        chart.scrollbarX.unselectedOverlay.fillOpacity = 0.85;

        // Add cursor
        chart.cursor = new am4charts.XYCursor();
        
        chart.cursor.xAxis = dateAxis;
        chart.cursor.snapToSeries = series;
        

        chart.events.on("hit", function(){
          let dataItem = series.tooltipDataItem;
          console.log("Clicked on series item, date:" + dataItem.dateX);
        })

        // chart.events.on("ready", function(ev) {
        //   updateImageLabel(series.dataItems.last);
        // });
    
        // chart.cursor.events.on("cursorpositionchanged", function(ev) {
        //   let dataItem = dateAxis.getSeriesDataItem(
        //     series,
        //     dateAxis.toAxisPosition(chart.cursor.xPosition),
        //     true
        //   );
        //   updateImageLabel(dataItem);
        // });

        // chart.cursor.events.on("hidden", function(ev) {
        //   updateImageLabel(series.dataItems.last);
        // });

        // chart.events.on("datavalidated", function(ev) {
        //   chart.series.each(function(theSeries) {
        //     theSeries.appear();
        //   });
        // });

        this.valueAxis = valueAxis;
        this.dateAxis = dateAxis;
        this.chart = chart;

        this.drawAverage();
    }

    drawAverage(){
        
      this.valueAxis.axisRanges.clear();
      let avgLineRange = this.valueAxis.axisRanges.create();
      
      avgLineRange.value = this.streamAverage;
      avgLineRange.grid.stroke = am4core.color("grey");
      avgLineRange.grid.strokeWidth = 2;
      avgLineRange.grid.strokeDasharray = "5,2"
      avgLineRange.label.inside = true;
      avgLineRange.label.fontSize = 12;
      avgLineRange.label.text = "Average";
      avgLineRange.label.location = 1.2;
      avgLineRange.label.fill = avgLineRange.grid.stroke;
      avgLineRange.label.valign = "bottom";
      avgLineRange.label.align = "right";


      
    }

    loadChartData(country){
          
      let countryData = spotify_data[country];
      // console.log(countryData);
      let chartData = [];

     
      // let colors = [am4core.color("yellow"), am4core.color("blue")]
      // let colors = ['', "3,3"] // strokeDasharray
      // let colorIdx = 0;

      let total = 0;
      for (var dateKey in countryData){
        if(countryData[dateKey]['streams']>0){//Bad values shouldn't be added.
          total += countryData[dateKey]['streams']
          chartData.push({
            date: dateKey,
            // visits: countryData[dateKey]['streams']
            streams: countryData[dateKey]['streams'],
            img: this.tracks[countryData[dateKey].track_id].img_link,
            artist: this.tracks[countryData[dateKey].track_id].artist,
            track: this.tracks[countryData[dateKey].track_id].track
          });

          // Change color when data switches
          // let l = chartData.length;
          // if (l > 1){
    
          //   if (chartData[l - 1].img !== chartData[l-2].img){
          //     colorIdx = 1 - colorIdx;
          //   }
          //   chartData[l-1].color = colors[colorIdx];
          // }



        }
      }
      this.streamAverage = total/chartData.length;
      
      return chartData;
    }

    componentDidUpdate(oldProps){
      
      if(oldProps.countryID !== this.props.countryID){//Update chart only on country change, not date
        let newData = this.loadChartData(this.props.countryID);
        setTimeout(() => {
          this.dateAxis.axisRanges.template.axisFill.fillOpacity=0.0;
        this.chart.data = newData
        this.chart.invalidateRawData();
        this.drawAverage();

        }, 500);
        
      }
      
    }

    componentWillUnmount() {
        if(this.chart) {
          this.chart.dispose();
        }
      }

    render() {
        return (
          <div className={` ${s.graphChart} p-3`}>
            
            <div className={s.graph} id="graph">
              <span>Alternative content for the map</span>
            </div>
          </div>
        );
      }

}

export default StreamChart;

