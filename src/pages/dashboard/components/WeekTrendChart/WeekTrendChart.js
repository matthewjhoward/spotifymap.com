import React, { Component } from 'react';

/* Imports */
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import s from './WeekTrendChart.module.scss';
import spotify_data from '../../../../data/charts-data'


class WeekTrendChart extends Component {
    constructor(props){
      super(props);
      this.state = {
        
      }
      this.tracks = require('../../../../data/tracks.json');
      
      
      this.componentDidMount = this.componentDidMount.bind(this);
    }
/* Chart code */
// Themes begin

    componentDidMount(){
        

        am4core.useTheme(am4themes_dark);
        am4core.useTheme(am4themes_animated);
        // Themes end

        // Create chart instance
        let chart = am4core.create("trend-bar", am4charts.XYChart);
        chart.numberFormatter.numberFormat = "#a";
        chart.numberFormatter.bigNumberPrefixes = [
          { "number": 1e+3, "suffix": "K" },
          { "number": 1e+6, "suffix": "M" },
          { "number": 1e+9, "suffix": "B" }
        ];
        // Add data
        chart.data = this.loadChartData(this.props.countryID);
        // console.log(chart.data);

        // Create axes
        let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        // dateAxis.renderer.labels.template.rotation = 90;
        dateAxis.renderer.minGridDistance = 1;
        dateAxis.renderer.labels.template.horizontalCenter = "middle";
        dateAxis.renderer.labels.template.verticalCenter = "middle"; 

        dateAxis.tooltip.background.fill = am4core.color("#1870DC");
        dateAxis.tooltip.label.fill = am4core.color("white");
        dateAxis.tooltip.background.strokeWidth = 0;

        // dateAxis.renderer.labels.template.events.on("over", (ev) => {
        //     var point = dateAxis.dateToPoint(ev.target.dataItem.date);
        //     chart.cursor.triggerMove(point, "soft");


        // });
        // dateAxis.renderer.labels.template.events.on("out", (ev) => {
        //     var point = dateAxis.dateToPoint(ev.target.dataItem.date);
        //     chart.cursor.triggerMove(point, "none");


        // });
        // dateAxis.


        
        

        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.tooltip.disabled=true;

        // Create series
        let series = chart.series.push(new am4charts.ColumnSeries());//Column to make a bar chart
        series.dataFields.valueY = "streams";


        series.connect = false;
        series.dataFields.dateX = "date";
        series.strokeWidth = 1;
        // series.tooltipText = "{valueY.formatNumber('#.##a')}";
        series.tooltip.background.fill = am4core.color("black");
        series.fill = am4core.color("#000");
        series.tooltip.getFillFromObject = false;
        series.tooltip.background.strokeWidth = 0;
        series.tooltip.pointerOrientation = "vertical";
        series.tooltip.label.padding(0,0,0,0);
        
        series.tooltipHTML = `
        <div class="card tooltipCard p-0">
        <div class="row no-gutters p-0">
            <div class="col-auto pl-0 pr-2">
              <img src="{img}" height="56px" /> 
            </div>
            <div class="col text-ellipsis text-muted">
                <div class="card-block px-2">
                <p class="card-text text-ellipsis py-0">
                {track}<br />
                {artist} <br />
                <span class="text-{textStyle}">{valueY.formatNumber('+#.#a|#.#a|0')} streams</span>
                </p>
                
                </div>
            </div>
        </div>

    </div>
    `


        // series.fillOpacity = 0.5;
        series.events.on("validated", () => {

          updateColumnsFill(dayPlusOne(this.props.date));
        });
        
        function dayPlusOne(d){
          let date = new Date(d);
          date.setDate(date.getDate() + 1);
          return date;
        }

        function sameDay(d1, d2) {
          return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
        }


        function updateColumnsFill(date){
            series.columns.each( (column) => {
                // console.log(column.dataItem);
                if(column.dataItem.values.valueY.value < 0){
                    column.fill = am4core.color("#F45722");
                    column.stroke = am4core.color("#F45722");
                    column.fillOpacity = 0.25;
                    column.strokeOpacity = 0.6;
                }else{
                    column.fill = am4core.color("#1DB954");
                    column.stroke = am4core.color("#1DB954");
                    column.fillOpacity = 0.5;
                    column.strokeOpacity = 0.8;
                }
                
                if(sameDay(column.dataItem.dateX, new Date(date))){
                  column.fillOpacity=1.0;
                }
            });
            // series.columns[series.columns.length - 1].fillOpacity=1.0;
        }

        // series.columns.template.events.on("hit", (ev) => {
        //     let dataItem = ev.target.dataItem;
        //     console.log("clicked on ", dataItem.dateX);
        //     console.log("Style:", dataItem.textStyle);
        //     this.props.setDate(new Date(dataItem.dateX));
            
        // });

        chart.events.on("hit", () => {
          let dataItem = series.tooltipDataItem;
          // console.log("Clicked on series item, date:" + dataItem.dateX);
          this.props.setDate(new Date(dataItem.dateX));
        })

        // dateAxis.renderer.labels.template.events.on("hit", (ev) => {
        //   var clickedDateLabel = new Date(ev.target.dataItem.dateX);
        //   this.props.setDate(clickedDateLabel);
          
        // })


        let totalSeries  = chart.series.push(new am4charts.LineSeries());
        totalSeries.dataFields.valueY = "trueLead";
        totalSeries.dataFields.dateX = "date";
        
        totalSeries.fillOpacity = 0;
        var bullet = totalSeries.bullets.push(new am4charts.CircleBullet());
        bullet.radius = 1;
        bullet.strokeWidth = 1;
        bullet.fillOpacity = 1;
        bullet.fill = am4core.color("#333867");
        // totalSeries.stroke = am4core.color("green");
        totalSeries.strokeDasharray = "3,3";


        totalSeries.tooltip.background.fill = am4core.color("black");
        totalSeries.fill = am4core.color("#000");
        totalSeries.tooltip.getFillFromObject = false;
        totalSeries.tooltip.background.strokeWidth = 0;
        totalSeries.tooltip.pointerOrientation = "vertical";
        totalSeries.tooltip.label.padding(0,0,0,0);
        totalSeries.tooltipHTML = `
        <div class="card tooltipCard p-0">
        <div class="row no-gutters p-0">
            <div class="col-auto pl-0 pr-2">
              <img src="{img}" height="56px" /> 
            </div>
            <div class="col text-ellipsis text-muted">
                <div class="card-block px-2">
                <p class="card-text text-ellipsis py-0">
                {track}<br />
                {artist} <br />
                <span class="fw-semi-bold">Lead</span>: <span class="text-success">{valueY.formatNumber('#.#a|#.#a|0')}</span>
                </p>
                
                </div>
            </div>
        </div>

    </div>
    `
        

        totalSeries.clustered = false;
        series.clustered = false;
          

        let columnHoverState = series.columns.template.states.create("hover");
        columnHoverState.properties.fillOpacity=1.0;


        // // Add cursor
        chart.cursor = new am4charts.XYCursor();
        chart.cursor.xAxis = dateAxis;
        chart.cursor.snapToSeries = [series, totalSeries];
        chart.cursor.behavior = "none";


        totalSeries.legendSettings.labelText = "Lead Over #2 Track";
        series.hiddenInLegend = true;
        // series.legendSettings.labelText = 
        chart.legend = new am4charts.Legend();
        chart.legend.position = "absolute";
        // chart.legend.valign = "top";
        chart.legend.x = am4core.percent(90);
        chart.legend.y = am4core.percent(90);

        this.series = series;
        this.chart = chart;

    }

    loadChartData(country){
          
      let countryData = spotify_data[country];
      let chartData = [];

      for (var dateKey in countryData){
      
        if(countryData[dateKey]['streams']>0){//Bad values shouldn't be added.
          chartData.push({
            date: dateKey,
            // visits: countryData[dateKey]['streams']
            streams: countryData[dateKey]['lead']

          });
        }
        if(dateKey === this.props.date){
            break;
        }

      }
    //   chartData = chartData.slice(Math.max(chartData.length - 7, 0))
    // return chartData;
    chartData = chartData.slice(Math.max(chartData.length - 8, 0))
    let outData = [];
    for(var i=1; i<chartData.length; i++){
        let chartItem = chartData[i];
        let dayData = countryData[chartItem.date];
        let change = chartItem.streams - chartData[i-1].streams
        outData.push({
            date: chartItem.date,
            streams: change,
            trueLead: chartItem.streams,
            textStyle: change > 0 ? 'success' : 'danger',
            img: this.tracks[dayData.track_id].img_link,
            artist: this.tracks[dayData.track_id].artist,
            track: this.tracks[dayData.track_id].track
        });
    }
    // console.log(outData);
    return outData;



      
      
    }

    componentDidUpdate(oldProps){
      
        // this.chart.data = this.loadChartData(this.props.countryID);
        if(oldProps.countryID !== this.props.countryID || oldProps.date !== this.props.date){
          let newData = this.loadChartData(this.props.countryID);
          this.chart.data = newData;

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
            
            <div className={s.graph} id="trend-bar">
              <span>Alternative content for the map</span>
            </div>
          </div>
        );
      }

}

export default WeekTrendChart;

