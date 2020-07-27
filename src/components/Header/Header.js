import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import {
  Navbar,

  NavbarBrand,

  Badge,

} from 'reactstrap';


import { openSidebar, closeSidebar, changeSidebarPosition, changeSidebarVisibility } from '../../actions/navigation';




import s from './Header.module.scss';
import LayoutContext from '../Layout/LayoutContext';

class Header extends React.Component {
  static contextType = LayoutContext;

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    sidebarPosition: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.onDismiss = this.onDismiss.bind(this);
    this.toggleMessagesDropdown = this.toggleMessagesDropdown.bind(this);
    this.toggleSupportDropdown = this.toggleSupportDropdown.bind(this);
    this.toggleSettingsDropdown = this.toggleSettingsDropdown.bind(this);
    this.toggleAccountDropdown = this.toggleAccountDropdown.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.toggleSearchOpen = this.toggleSearchOpen.bind(this);

    this.state = {
      visible: true,
      messagesOpen: false,
      supportOpen: false,
      settingsOpen: false,
      searchFocused: false,
      searchOpen: false,
      notificationsOpen: false,
      headerClass: "",
      labelClass: ""
    };
  }

  componentDidMount(){
    window.addEventListener("scroll", this.handleScroll);
  }

  toggleNotifications = () => {
    this.setState({
      notificationsOpen: !this.state.notificationsOpen,
    });
  }

  onDismiss() {
    this.setState({ visible: false });
  }


  toggleMessagesDropdown() {
    this.setState({
      messagesOpen: !this.state.messagesOpen,
    });
  }

  toggleSupportDropdown() {
    this.setState({
      supportOpen: !this.state.supportOpen,
    });
  }

  toggleSettingsDropdown() {
    this.setState({
      settingsOpen: !this.state.settingsOpen,
    });
  }

  toggleAccountDropdown() {
    this.setState({
      accountOpen: !this.state.accountOpen,
    });
  }

  toggleSearchOpen() {
    this.setState({
      searchOpen: !this.state.searchOpen,
    });
  }

  toggleSidebar() {
    this.props.isSidebarOpened 
      ? this.props.dispatch(closeSidebar())
      : this.props.dispatch(openSidebar())
  }

  moveSidebar(position) {
    this.props.dispatch(changeSidebarPosition(position));
  }

  toggleVisibilitySidebar(visibility) {
    this.props.dispatch(changeSidebarVisibility(visibility));
  }

  handleScroll = ()=> {
    if (window.pageYOffset>25){
      if(!this.state.headerClass){//Toggle Shadow on Scroll
        this.setState({
          headerClass: s.headerShadow
        });
      }

      if(!this.state.labelClass){
        this.setState({labelClass: s.show})
      }
    }else{
      if(this.state.headerClass){
        this.setState({headerClass: ""});
      }
      if(this.state.labelClass){
        this.setState({labelClass: ""});
      }
    }

  
  }

  render() {

    return (
      // ${this.state.headerClass}
      <Navbar className={`${s.root} ${this.state.headerClass}`} sticky="top">
        <NavbarBrand className={`${s.logo} mr-0`} href="/">Spotify <span className="fw-bold">Map</span> 
        {/* <span id="dashLabel" className={`fw-thin ${s.titleLabel} ${this.state.labelClass}`}> <i className="fa fa-caret-right ml-2 mr-2"></i> Dashboard</span>  */}
        
        </NavbarBrand>

        {/* <span className={`${s.divider} text-white`} >&nbsp;</span>   
                    <span className={s.tagline}>Explore the world's most streamed and viral songs!</span>  */}
        

        {/* <UncontrolledAlert className={`${s.alert} mr-3 d-lg-down-none`}>
          <i className="fa fa-info-circle mr-1" /> Thanks for stopping by! <button className="btn-link" href="#">Donate</button> to support
        </UncontrolledAlert> */}
        
        <span className={`${s.countryDate} d-inline-block`}>
        <Badge className={`${s.countryBadge} fw-semi-bold`}>{this.context.data.country}</Badge> <Badge className={`${s.countryBadge} fw-semi-bold`}>{this.context.data.date}</Badge>
        </span>

        {/* <span className={`${s.countryDate} d-inline-block`}>
        <Badge className={`${s.countryBadge} fw-semi-bold`}>{this.context.data.country} &nbsp; / &nbsp; {this.context.data.date}</Badge>
        </span> */}
       
      </Navbar>
    );
  }
}

function mapStateToProps(store) {
  return {
    isSidebarOpened: store.navigation.sidebarOpened,
    sidebarVisibility: store.navigation.sidebarVisibility,
    sidebarPosition: store.navigation.sidebarPosition,
  };
}

export default withRouter(connect(mapStateToProps)(Header));

