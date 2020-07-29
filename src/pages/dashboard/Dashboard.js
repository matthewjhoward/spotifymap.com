import React from 'react';
import {
  Row,
  Col,
  Button,
  Badge,
  Card,
  CardBody,
  CardFooter,
  CardText,
  CardImg,
  Container,
  Popover, PopoverHeader, PopoverBody
} from 'reactstrap';


import spotify_data from '../../data/charts-data';
import track_position from '../../data/track-position'
import country_track from '../../data/country-track';


import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


import Widget from '../../components/Widget';

import Map from './components/am4chartMap/am4chartMap';
import StreamChart from './components/StreamChart/StreamChart';
import WeekTrendChart from './components/WeekTrendChart/WeekTrendChart';


import s from './Dashboard.module.scss';

import sx from './DashboardMetro.module.scss';

import LayoutContext from '../../components/Layout/LayoutContext';

class Dashboard extends React.Component {
  static contextType = LayoutContext;
  _isMounted = false;
  constructor(props) {
    super(props);

    // let countryIDS = Object.keys(spotify_data);

    let keys = Object.keys(spotify_data['GLOBAL'])
    let lastDate = keys[keys.length-1]

    let global_latest = spotify_data['GLOBAL'][lastDate];
    console.log(lastDate);
    this.state = {
      popOpen: true,
      popovers: [false, false, false, false, false, false],
      graph: null,
      country: 'Global',
      countryID: 'GLOBAL',
      track_id: global_latest['track_id'],
      v_track_id: global_latest['v_track_id'],
      date: lastDate,
      latest: lastDate,
      playerTrack: 'https://open.spotify.com/embed/track/'+global_latest['track_id']
    };

    

    

    
    this.tracks = require('../../data/tracks.json');

    this.setCountryData = this.setCountryData.bind(this);
    this.setDate = this.setDate.bind(this);
    this.dateChange = this.dateChange.bind(this);


  }

  componentDidMount(){
    this._isMounted = true;
    // this.context.setData({country: this.state.countryID, date: this.state.date});
  }

  componentWillUnmount(){
    this._isMounted = false;
  }



  setCountryData(countryData) {

    this.setState(countryData);
    // console.log(countryData);
    this.context.setData({ 
      countryID: countryData.countryID, 
      country: countryData.country,
      date: this.context.data.date
    });
  }

  numberWithCommas(x) {
    if (x === undefined) {
      return undefined;
    }
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }



 

  setDate(d) {
    this.setState({ date: d })
  }

  dateChange = d => {
    console.log(d)

    // var datestring = (("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2)) + "-" +
    //   d.getFullYear();

    var datestring = d.getFullYear() + "-" + (("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2));
    this.setState({ date: datestring })
  }

  toggle(id, field) {
    const newState = [...this.state[field]];
    newState.fill(false);

    if (!this.state[field][id]) {
      newState[id] = true;
    }

    this.setState({
      [field]: newState,
    });
  }

  dayPlusOne(d) {
    let date = new Date(d);
    date.setDate(date.getDate() + 1);
    return date;
  }

  trackHighlights(){
    let highlights = [];




     const getWidget = (track_id, idx, isViral) => {

      let trackPositionData = track_position[this.state.date][track_id];
      let trackDataValid = trackPositionData && trackPositionData['global_position'];
      let top_position = trackDataValid ? trackPositionData['global_position']['top'] : 201;
      let vir_position = trackDataValid ? trackPositionData['global_position']['viral'] : 201;
      top_position = top_position === 201 ? "\u2014" : "# " + top_position;
      vir_position = vir_position === 201 ? "\u2014" : "# " + vir_position;


      let topIn = trackPositionData ? trackPositionData['top_regions'] : undefined
      let viralIn = trackPositionData ? trackPositionData['viral_regions'] : undefined;

      let days_leading, max_streams, top_days;
      let daysBefore = [];
      if(!isViral){
        top_days = country_track[this.state.countryID]['top'][track_id]
        for(var day in top_days){
          if (day > this.state.date){
            break;
          }else{
            daysBefore.push(top_days[day]);
          }
        }
        
        max_streams = this.numberWithCommas(Math.max(...daysBefore));

      }else{
        top_days = country_track[this.state.countryID]['viral'][track_id]
        for(day in top_days){
          if (day > this.state.date){
            break;
          }else{
            daysBefore.push(day);
          }
        }
      }


      days_leading = daysBefore.length;
      


      return (
        <Widget   
                  key = {idx}
                  title={<h4>Track <span className="fw-semi-bold">Highlights</span></h4> }
                  className={`widget-padding-md text-white`}>

                  <div className={sx.slideWrap}>

                    <Card>
                  <Row className={` ${s.highlightTopRow} no-gutters `}>
                      <Col xl="5" lg="5" md="5" sm="4">
                        <CardImg top
                          width="75%"
                          
                          src={this.tracks[track_id].img_link} 
                          alt="Card image cap"
                        />
                      </Col>
                      
                      <Col xl="7" lg="7" md="7" sm="8" className="align-self-center">
                        <CardBody>

                        <Container className="text-center ">
                            <h5 className="fw-bold">Global Chart Positions</h5> 
                            {/* <small className="fw-thin">(as of {this.state.date})</small> */}
                            </Container>
                            
                            <Row className="py-3">
                              <Col className="text-center">
                              <h4>Top 200</h4>
                              <Badge className={s.chartBadge}>{top_position}</Badge>
                              </Col>
                              <Col className="text-center">
                              <h4>Viral 50</h4>
                              <Badge className={s.chartBadge}>{vir_position}</Badge>
                              </Col>
                            </Row>
                            
                          
                          
                          
                        
                        </CardBody>
                        
                      </Col>
                    </Row>
                    
                      <Container className="text-center pt-2">
                            <h6 className="fw-bold">Regional Stats <span className="fw-normal">&mdash; {this.state.country}</span></h6> 
                            </Container>

                            

                            <Row className='pb-3'>
                              {!isViral && <Col className="text-center">
                                
                              <h6 className="fw-semi-bold">Peak Streams </h6>
                              {max_streams}
                              
                              </Col>}
                              <Col className="text-center">
                              <h6 className="fw-semi-bold">Days at #1 </h6>
                              {days_leading}
                              </Col>
                            </Row>

                            <Row className='pb-2'>
                              <Col className="text-center">
                              <h6 className="fw-semi-bold">Most Streamed in </h6>
                              {topIn} / 60 regions
                              
                              </Col>
                              <Col className="text-center">
                              <h6 className="fw-semi-bold">Most Viral in </h6>
                              {viralIn} / 60 regions
                              </Col>
                            </Row>
                    
                    <CardFooter className={` ${s.highlightFooter} text-muted text-center`}>Data shown for selected date: <span className={`fw-semi-bold`}>{this.state.date}</span></CardFooter>
                  </Card>

                  </div>
                  </Widget>
                  
      )}

    
    if(this.state.track_id){
      let data =  getWidget(this.state.track_id, highlights.length, false);
      highlights.push(data);
    }

    if(this.state.v_track_id){
      let data = getWidget(this.state.v_track_id, highlights.length, true)
      highlights.push(data);
    }

    return highlights

  }

  getTrackWidget(isViral) {
    let id = isViral ? this.state.v_track_id : this.state.track_id
    let trackInfo = this.tracks[id];

    let artist, track, link, img, streams, widget;




    if (id === undefined || id === "") {
      widget = <Card className="border-0 mb-0">
        <CardImg top width="100px" src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/320/apple/237/crying-face_1f622.png" alt="Card image cap" />
        <CardBody>
          {/* <CardTitle className='text-left fw-bold'>{title}</CardTitle> */}
          <CardText>
            No Data
        </CardText>
        </CardBody>
      </Card>
    } else {

      artist = trackInfo.artist;
      track = trackInfo.track;
      link = 'https://open.spotify.com/embed/track/' + id;
      img = trackInfo.img_link;
      streams = isViral ? <span>&nbsp;<br /></span> : <span className='text-success fw-bold'>{this.numberWithCommas(this.state.streams)} streams</span>


      widget = 
      <Card className="border-0 text-center">
        <CardImg top width="100%" src={img} alt="Card image cap" />
        <CardBody>
          <CardText className={`text-ellipsis`}>
            {artist}<br />
            {track} <br />
            {streams}
          </CardText>
          <div className="w-100 text-center">
            <Button className="btn btn-rounded-f" color="primary" onClick={() => this.setState({ playerTrack: link })}>Queue Track &nbsp;<i className="fa fa-external-link-square" /></Button>
          </div>
        </CardBody>
      </Card>;
    }

    return widget;



  }
  render() {
    // console.log("Context", this.context)
    
    let highlights = this.trackHighlights();
    let mostWidget = this.getTrackWidget(false);
    let viralWidget = this.getTrackWidget(true);

    

    let settings = {
      dots: true,
      infinite: true,
      vertical: false,
      autoplay: true,
      autoplaySpeed: 7000,
      fade: true,
      speed: 500,
      adaptiveHeight: true,
      arrows: true,
      horizontalSwiping: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      draggable: true,
    };

    return (

      <div className={s.root}>
        <Row>
          <Col lg={8} md={8}>
            <h1 className='d-inline-block'>Dashboard  &nbsp;</h1>

          

            <h1 className='d-inline-block'>
              <span className={`${s.country} fw-bold`}>{this.context.data.country}&nbsp;</span>
            </h1>



          </Col>




        </Row>

        <Row>
          <Col xl={8} lg={7} xs={12}>
            <Widget className="bg-transparent">
              <Map setCountryData={this.setCountryData} date={this.context.data.date} countryID={this.context.data.countryID}/>
            </Widget>
          </Col>


          <Col xl={4} lg={5} xs={12}>
            <Widget
              title={<h5> Spotify <span className="fw-semi-bold">Web Player</span> </h5>}

            >

              <iframe title='spotify-embed' id='spotify-embed' src={this.state.playerTrack}
                frameBorder="0" allowtransparency="true" height="80px" width="100%"
                allow="encrypted-media"></iframe>
            </Widget>

            <Row >
              <Col lg={12} >


                <Widget title={<h5> Daily <span className="fw-semi-bold">Chart Leaders</span> </h5>}
                  className='mb-xlg'>
                  <hr className='mt-0' />
                  <Row className='text-center text-white'>
                    <Col lg={6} md={6} xs={6} >
                      <h5>Spotify <span className='fw-bold'>Top 200</span></h5>
                      {/* <h3 className="fw-semi-bold">Top 200</h3> */}
                      {mostWidget}

                    </Col>
                    <Col lg={6} md={6} xs={6} >
                    <h5>Spotify <span className='fw-bold'>Viral 50</span></h5>
                      
                      {viralWidget}
                    </Col>

                  </Row>
                </Widget>

              </Col>

            </Row>


          </Col>


        </Row>


        <Row>
          <Col xl={8} lg={7} xs={12}>


            <Widget
              title={<h5>Leader <span className="fw-semi-bold">Stream Totals</span> 
              
              <Badge 
                id="p-1" className="ml-2 px-1 py-1 btn align-top" color="info"
                onClick={() => this.toggle(0, 'popovers')}
              > <i className="fa fa-info-circle"></i></Badge>
              
              </h5>  }
              close collapse
            >



    <Popover placement="bottom" isOpen={this.state.popovers[0]} target="p-1" toggle={() => this.toggle(0, 'popovers')} className={`${s.pop} pb-0 mb-0`}>
            
            <PopoverHeader className="fw-semi-bold">Leader Stream Totals</PopoverHeader>
          <PopoverBody>Displays the number of streams gained by the most streamed track in the selected region (default: Global). 
          <br />
            Spikes may indicate popular new songs.
          </PopoverBody>
            
          
        </Popover>
              <StreamChart countryID={this.context.data.countryID} />
            </Widget>
          </Col>
          <Col xl={4} lg={5} xs={12}>
            <Widget
              title={<h5>7-Day <span className="fw-semi-bold">Lead Trend</span>
              
              <Badge 
                id="p-2" className="ml-2 px-1 py-1 btn align-top" color="info"
                onClick={() => this.toggle(1, 'popovers')}
              > <i className="fa fa-info-circle"></i></Badge>
              
              </h5>}
              close collapse
            >

<Popover placement="bottom" isOpen={this.state.popovers[1]} target="p-2" toggle={() => this.toggle(1, 'popovers')} className={`${s.pop} pb-0 mb-0`}>
            
            <PopoverHeader className="fw-semi-bold">7-Day Lead Trend</PopoverHeader>
          <PopoverBody>Displays the 7-day streaming lead of the #1 streamed track over the #2 track (line) and the daily changes (columns) in that lead.
            <br />
            Lines approaching 0 may indicate a track is losing steam on the charts.
          </PopoverBody>
            
          
        </Popover>
              <WeekTrendChart countryID={this.state.countryID} date={this.context.data.date} setDate={this.dateChange} />
            </Widget>

          </Col>
        </Row>

        <Row>

          <Col xl={5} lg={7}>
          <div className="clearfix">
                <Slider {...settings} className={`${sx.hideOverflow} ${s.trackHighlights}`}>
                  {highlights}
          </Slider>
          </div>
          </Col>
          

          <Col xl={5} lg={5} >

            <Widget
              title = {<h5><span className="">Spotify</span> <span className="fw-bold">Map</span> &mdash; A Note From The Author</h5>}>
              
              <h5 className="fw-semi-bold text-white">About</h5>

              <p>Spotify Map is an open-source, interactive dashboard powered by data from <a target="_blank" rel="noopener noreferrer" href="https://spotifycharts.com">Spotify Charts</a>. 
              </p>
              <p className="text-xl-left text-center">
              <a target="_blank" rel="noopener noreferrer" href="https://github.com/matthewjhoward/spotifymap.com">
              <Button className={`btn btn-inverse ${s.ghButton} fw-semi-bold`}>
                <i className="fa fa-github" aria-hidden="true"></i>&nbsp; View on GitHub
                </Button>
                </a>

              </p>
              

              
              <p className="mb-1">Spotify Map was created out of my love for music and data. I wanted to simplify the discovery of popular and rising tracks from all around the world and visualize how these tracks rise and fall. Here's to hoping you find a great new track to put on repeat! <br />&nbsp;<span className="blockquote-footer float-right">Matt</span>
              </p>
              
            


            <h5 className="fw-semi-bold text-white">Feature Request? Find a Bug? Let me know!</h5>
            <p>I am constantly looking for ways to improve the performance and user experience on Spotify Map. If you have a feature request or find an issue with the site, please <a target="_blank" rel="noopener noreferrer" href="https://github.com/matthewjhoward/spotifymap.com/issues">submit an issue on <i className="fa fa-github" aria-hidden="true"></i> GitHub</a>.


            </p>
            <h5 className="fw-semi-bold text-white">Support the Site</h5>
            <p>
              If you enjoy the site and wish to contribute to keep the site running and support feature development, use the donation link below.
            </p>
            
            <p className="text-xl-left text-center">
            <a className={`${s.bmcButton}`} target="_blank" rel="noopener noreferrer" href="https://www.buymeacoffee.com/matthewhoward"><img src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" alt="Buy me a coffee" /><span>Buy me a coffee</span></a>
            </p>
            

            </Widget>
          </Col>
          <Col lg={2} >
          </Col>

          
          

        </Row>






            
      </div>
    );
  }
}


export default Dashboard;
