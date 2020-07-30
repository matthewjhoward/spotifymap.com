import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import {
  Navbar,

  NavbarBrand,
  NavItem,
  Button,
  Badge,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem

} from 'reactstrap';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getFlag } from '../../helpers';

import logo from '../../images/logo.png';
import cal from '../../images/calendar.png';
import { openSidebar, closeSidebar, changeSidebarPosition, changeSidebarVisibility } from '../../actions/navigation';




import s from './Header.module.scss';
import LayoutContext from '../Layout/LayoutContext';
import spotify_data from '../../data/charts-data';

class Header extends React.Component {
  static contextType = LayoutContext;

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    sidebarPosition: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);



    this.countries = Object.keys(spotify_data);
    this.countries.splice(this.countries.indexOf("GLOBAL"), 1)
    this.countries = ["GLOBAL"].concat(this.countries)


    let dates = Object.keys(spotify_data['GLOBAL'])
    this.firstDate = dates[0];
    this.lastDate = dates[dates.length - 1];

    this.onDismiss = this.onDismiss.bind(this);
    this.countryList = require("country-list");
    this.countryList.overwrite([
      { code: 'GB', name: 'United Kingdom' },
      { code: 'BO', name: 'Bolivia' },
      { code: 'TW', name: 'Taiwan' },
    ])

    this.toggleCountryDropdown = this.toggleCountryDropdown.bind(this);
    this.toggleDateDropdown = this.toggleDateDropdown.bind(this);
    this.dateChange = this.dateChange.bind(this);
    this.handleCountryChange = this.handleCountryChange.bind(this);
    this.dayPlusOne = this.dayPlusOne.bind(this);
    this.nameFromID = this.nameFromID.bind(this);


    this.state = {
      visible: true,

      headerClass: "",
      labelClass: "",
      countryOpen: false,
      dateOpen: false
    };
  }

  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
  }

  toggleCountryDropdown() {
    this.setState({ countryOpen: !this.state.countryOpen });
  }

  handleCountryChange(countryID) {
    this.context.setData({ country: this.context.data.country, date: this.context.data.date, countryID: countryID });
  }

  toggleDateDropdown() {

  }

  nameFromID(id) {
    let r;

    if (id === 'GLOBAL') {
      r = 'Global';
    } else {
      r = this.countryList.getName(id)
    }
    return r;
  }

  dateChange = d => {


    var datestring = d.getFullYear() + "-" + (("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2));
    this.context.setData({ country: this.context.data.country, countryID: this.context.data.countryID, date: datestring });
  }



  onDismiss() {
    this.setState({ visible: false });
  }

  dayPlusOne(d) {
    let date = new Date(d);
    date.setDate(date.getDate() + 1);
    return date;
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

  handleScroll = () => {
    if (window.pageYOffset > 25) {
      if (!this.state.headerClass) {//Toggle Shadow on Scroll
        this.setState({
          headerClass: s.headerShadow
        });
      }

      if (!this.state.labelClass) {
        this.setState({ labelClass: s.show })
      }
    } else {
      if (this.state.headerClass) {
        this.setState({ headerClass: "" });
      }
      if (this.state.labelClass) {
        this.setState({ labelClass: "" });
      }
    }


  }

  render() {

    return (
      // ${this.state.headerClass}
      <Navbar className={`${s.root} ${this.state.headerClass}`} sticky="top">
        <NavbarBrand className={`${s.logo} mr-0`} href="/">
          <span>
            <img className={s.headerImage} src={logo} alt="..." />
          Spotify <span className="fw-bold">Map</span>
          </span>


        </NavbarBrand>

        <div className={s.dropdownButtons}>

          <ButtonDropdown isOpen={this.state.countryOpen} toggle={this.toggleCountryDropdown}>

            <DropdownToggle caret size="sm" color="dark" className={`${s.dropDownToggle} btn`}>
            {getFlag(this.context.data.countryID)} <span class="d-none d-md-inline">{" " + this.nameFromID(this.context.data.countryID)}</span>
              {/* {this.context.data.country} */}
            </DropdownToggle>
            <DropdownMenu size="sm" className={s.dropDownMenu} right>
              <DropdownItem header disabled>Select Region</DropdownItem>
              
              
              {
                this.countries.map(country =>
                  <DropdownItem key={country} onClick={() => this.handleCountryChange(country)}>{getFlag(country) + " " + this.nameFromID(country)}</DropdownItem>

                )}
            </DropdownMenu>
          </ButtonDropdown>


          <DatePicker
            className={s.datePicker}
            popperPlacement="bottom-end"


            closeOnScroll={true}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            minDate={this.dayPlusOne(this.firstDate)}
            maxDate={this.dayPlusOne(this.lastDate)}
            dateFormat="MM-dd-yyyy"

            selected={this.dayPlusOne(new Date(this.context.data.date))}
            onChange={this.dateChange}
            customInput={
            <Button size="sm" className={` ${s.dropDownToggle} btn text-white`} color='dark' id="calPop">
              <img src={cal} alt="calendar" /> <span class="d-none d-md-inline">{this.context.data.date}</span>
            </Button>}
          />

        </div>
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

