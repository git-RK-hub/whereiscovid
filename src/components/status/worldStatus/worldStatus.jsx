import React, { PureComponent, Fragment } from "react";
import classes from "./worldStatus.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import countryCoordinates from "../../../data/countries.json";
import GoogleMapReact from "google-map-react";
import CountryMarker from "../countryMarker/countryMarker";
import RotatedTitle from "../../../assets/img/rotatedTitle.png";
import InfoBox from "../infoBox/infoBox";

class Status extends PureComponent {
  retrieveData() {
    fetch("https://api.whereiscovid.info/countries.json")
      .then((blob) => blob.json())
      .then((data) =>
        this.setState({
          mainData: data.map((country) => {
            return {
              ...country,
              casesPerOneMillion: country.casesPerOneMillion ?? 0,
              latitude:
                countryCoordinates.filter(
                  (coord) => coord.name === country.country
                )[0] !== undefined
                  ? countryCoordinates.filter(
                      (coord) => coord.name === country.country
                    )[0].lat
                  : country.countryInfo.lat,
              longitude:
                countryCoordinates.filter(
                  (coord) => coord.name === country.country
                )[0] !== undefined
                  ? countryCoordinates.filter(
                      (coord) => coord.name === country.country
                    )[0].lng
                  : country.countryInfo.long,
            };
          }),
        })
      )
      .then(() => this.sortData());
  }

  sortData() {
    const sortedCase = [...this.state.mainData]
      .sort((a, b) => b.cases - a.cases)
      .slice(0, 20);
    const sortedDeaths = [...this.state.mainData]
      .sort((a, b) => b.deaths - a.deaths)
      .slice(0, 20);
    const sortedTodayCases = [...this.state.mainData]
      .sort((a, b) => b.todayCases - a.todayCases)
      .slice(0, 20);
    const sortedTodayDeaths = [...this.state.mainData]
      .sort((a, b) => b.todayDeaths - a.todayDeaths)
      .slice(0, 20);
    const sortedRecovered = [...this.state.mainData]
      .sort((a, b) => b.recovered - a.recovered)
      .slice(0, 20);
    const sortedActive = [...this.state.mainData]
      .sort((a, b) => b.active - a.active)
      .slice(0, 20);
    const sortedCritical = [...this.state.mainData]
      .sort((a, b) => b.critical - a.critical)
      .slice(0, 20);
    const sortedCasesPerOneMillion = [...this.state.mainData]
      .sort((a, b) => b.casesPerOneMillion - a.casesPerOneMillion)
      .slice(0, 20);
    this.setState({
      top10Cases: {
        cases: sortedCase,
        deaths: sortedDeaths,
        todayCases: sortedTodayCases,
        todayDeaths: sortedTodayDeaths,
        recovered: sortedRecovered,
        active: sortedActive,
        critical: sortedCritical,
        casesPerOneMillion: sortedCasesPerOneMillion,
      },
    });
  }

  handleWindowResize() {
    window.addEventListener("resize", (e) => {
      if (e.srcElement.outerWidth < 900 && e.srcElement.outerWidth >= 600) {
        this.setState({ isSmallScreen: true, mapHeight: 60 });
      } else if (e.srcElement.outerWidth >= 900) {
        this.setState({
          isSmallScreen: false,
          isXSmallScreen: false,
          mapHeight: 60,
        });
      } else if (e.srcElement.outerWidth < 600) {
        this.setState({ isXSmallScreen: true, mapHeight: 100 });
      }
    });
  }

  handleFirstTable() {
    if (window.outerWidth >= 900) {
      this.setState({
        isSmallScreen: false,
        isXSmallScreen: false,
        mapHeight: 60,
      });
    } else if (window.outerWidth >= 600 && window.outerWidth < 900) {
      this.setState({ isSmallScreen: true, mapHeight: 60 });
    } else if (window.outerWidth < 600) {
      this.setState({ isXSmallScreen: true, mapHeight: 100 });
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      mainData: [],
      top10Cases: {
        cases: [],
        todayCases: [],
        deaths: [],
        todayDeaths: [],
        recovered: [],
        active: [],
        critical: [],
        casesPerOneMillion: [],
      },
      sortBy: "cases",
      selectedCountry: null,
      isSmallScreen: false,
      isXSmallScreen: false,
      mapHeight: 60,
    };
  }
  componentDidMount() {
    this.retrieveData();
    this.handleFirstTable();
    this.handleWindowResize();
  }

  render() {
    return (
      <div>
        <div
          style={{ height: `${this.state.mapHeight}vh`, width: "100%" }}
          onClick={() => this.setState({ selectedCountry: null })}
        >
          <GoogleMapReact
            defaultCenter={[30, 0]}
            defaultZoom={1}
            bootstrapURLKeys={{
              key: "AIzaSyA3jSaFgByAz1ZNwNWJXj_HmoEMntLPEj8",
              language: "en",
            }}
          >
            {this.state.mainData.map((country) => {
              return (
                <CountryMarker
                  key={country.country}
                  lat={country.latitude}
                  lng={country.longitude}
                  data={country}
                  sortBy={this.state.sortBy}
                  onClick={(event) => {
                    this.setState({ selectedCountry: country });
                    event.stopPropagation();
                  }}
                />
              );
            })}

            {this.state.selectedCountry ? (
              <InfoBox
                countryData={this.state.selectedCountry}
                lat={this.state.selectedCountry.latitude}
                lng={this.state.selectedCountry.longitude}
              />
            ) : null}
          </GoogleMapReact>
        </div>
        {this.state.isXSmallScreen ? null : (
          <div className={classes.table__container}>
            <p className={classes.table__info}>
              {" "}
              You can click on the headers to see data ordered for each
              parameter.
            </p>
            <div className={classes.table__inner__container}>
              <div className={classes.table__header__container}>
                <img
                  className={classes.table__header}
                  src={RotatedTitle}
                  alt="table title"
                />
              </div>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>Country</th>
                    <th
                      onClick={() =>
                        this.setState({
                          sortBy: "cases",
                        })
                      }
                      className={
                        this.state.sortBy === "cases"
                          ? classes.active_case
                          : null
                      }
                    >
                      Cases <FontAwesomeIcon icon={faSort} />
                    </th>
                    <th
                      onClick={() => this.setState({ sortBy: "todayCases" })}
                      className={
                        this.state.sortBy === "todayCases"
                          ? classes.active_case
                          : null
                      }
                    >
                      Today's Cases <FontAwesomeIcon icon={faSort} />
                    </th>
                    <th
                      onClick={() => this.setState({ sortBy: "deaths" })}
                      className={
                        this.state.sortBy === "deaths"
                          ? classes.active_death
                          : null
                      }
                    >
                      Deaths <FontAwesomeIcon icon={faSort} />
                    </th>
                    <th
                      onClick={() => this.setState({ sortBy: "todayDeaths" })}
                      className={
                        this.state.sortBy === "todayDeaths"
                          ? classes.active_death
                          : null
                      }
                    >
                      Today's Deaths <FontAwesomeIcon icon={faSort} />
                    </th>
                    {this.state.isSmallScreen ? null : (
                      <Fragment>
                        <th
                          onClick={() => this.setState({ sortBy: "recovered" })}
                          className={
                            this.state.sortBy === "recovered"
                              ? classes.active_recovered
                              : null
                          }
                        >
                          Recovered <FontAwesomeIcon icon={faSort} />
                        </th>
                        <th
                          onClick={() => this.setState({ sortBy: "active" })}
                          className={
                            this.state.sortBy === "active"
                              ? classes.active_active
                              : null
                          }
                        >
                          Active <FontAwesomeIcon icon={faSort} />
                        </th>
                        <th
                          onClick={() => this.setState({ sortBy: "critical" })}
                          className={
                            this.state.sortBy === "critical"
                              ? classes.active_critical
                              : null
                          }
                        >
                          Critical <FontAwesomeIcon icon={faSort} />
                        </th>{" "}
                      </Fragment>
                    )}
                    <th
                      onClick={() =>
                        this.setState({ sortBy: "casesPerOneMillion" })
                      }
                      className={
                        this.state.sortBy === "casesPerOneMillion"
                          ? classes.active_casesPerMillion
                          : null
                      }
                    >
                      Cases per 1M <FontAwesomeIcon icon={faSort} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.top10Cases[this.state.sortBy].map((country) => {
                    return (
                      <tr key={country.country}>
                        <td>{country.country}</td>
                        <td>{country.cases.toLocaleString()}</td>
                        <td>{country.todayCases.toLocaleString()}</td>
                        <td>{country.deaths.toLocaleString()}</td>
                        <td>{country.todayDeaths.toLocaleString()}</td>
                        {this.state.isSmallScreen ? null : (
                          <Fragment>
                            <td>{country.recovered.toLocaleString()}</td>
                            <td>{country.active.toLocaleString()}</td>
                            <td>{country.critical.toLocaleString()}</td>{" "}
                          </Fragment>
                        )}
                        <td>{country.casesPerOneMillion.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Status;
