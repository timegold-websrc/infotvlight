import React from 'react';
import { Header } from '../layouts/Header'
import { Footer } from '../layouts/Footer'
import Common from '../Common'
import $ from 'jquery'
import { Link } from 'react-router-dom'
import Pagination from "react-js-pagination"
import App from '../App';
import { strings } from '../Localization';


export class Overlays extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      tickerGroups: [],
      pageIndex: 1,
      totalCount: 0,
      search: '',
      from: 0,
      to: 0
    }
  }

  componentDidMount() {
    this.getTickerGroups(1);
  }

  getTickerGroups(pageIndex = null) {
    if(pageIndex === null) {
      pageIndex = this.state.pageIndex;
    }
    let url = Common.BACKEND + '/api/tickerGroups';
    url += '?page=' + pageIndex;
    url += '&token=' + Common.getToken();
    url += '&search=' + this.state.search;

    let self = this;
    $('.loading').show();

    $.ajax({
      url: url,
      method: 'GET',
      success: function (data) {
        $('.loading').hide();

        self.setState({
          tickerGroups: data.data,
          totalCount: data.total,
          pageIndex: pageIndex,
          from: data.from,
          to: data.to
        });
        console.log('overlays', data.data);
      },
      error: function (error) {
        Common.handleError(error);
      }
    });
  }

  handlePageChange(pageNumber) {
    this.getTickerGroups(pageNumber);
  }

  handleDelete(id) {
    let self = this;
    App.confirm(strings.AreYouSureToDeleteThisGroup, function() {
      let url = Common.BACKEND + '/api/tickerGroups';
      url += '?token=' + Common.getToken();
      url += '&id=' + id;

      $('.loading').show();
      $.ajax({
        url: url,
        method: 'DELETE',
        success: function (data) {
          $('.loading').hide();

          Common.notify('success', strings.TheOverlayGroupHasBeenDeleted);
          self.getTickerGroups();
        },
        error: function (error) {
          Common.handleError(error);
        }
      });
    });
  }

  handleChange(event) {
    let name = event.target.name;
    let state = this.state;
    state[name] = event.target.value;
    this.setState(state);
  }

  handleSearch(event) {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  onSearch = () => {
    let self = this;
    window.setTimeout(function () {
      self.getTickerGroups();
    }, 10);
  }

  render() {
    let self = this;
    let groups = this.state.tickerGroups.map(function (item, i) {
      let index = (self.state.pageIndex - 1) * 10 + i + 1;

      return (
        <tr key={item.id} style={{ verticalAlign: 'middle' }}>
          <td className="text-center">
            <span className="text-muted">{index}</span>
          </td>
          <td>
            <Link to={'/overlays/' + item.id}>
              {item.group_name}
            </Link>
          </td>
          <td>{item.tickerObjects.length}</td>
          <td>{Common.humanDate(item.created_at)}</td>
          <td>
            <Link to="#" className="icon" onClick={self.handleDelete.bind(self, item.id)}>
              <i className="fe fe-trash"></i>
            </Link>
          </td>
        </tr>
      )
    });

    return (
      <div className="page-main">
        <Header />
        <div className="my-3 my-md-5 main-content">
          <div className="container">
            <div className="page-header">
              <h1 className="page-title">{strings.ManageOverlays}</h1>
              <div className="page-subtitle">{this.state.from} - {this.state.to} {strings.of} {this.state.totalCount} {strings.playlists}</div>
              <div className="page-options d-flex">
                <div className="input-icon">
                  <span className="input-icon-addon">
                    <i className="fe fe-search"></i>
                  </span>
                  <input type="text" className="form-control w-10" placeholder={strings.Search + ' ' + strings.overlay}
                    name="search" value={this.state.search} onKeyUp={this.handleSearch.bind(this)} onChange={this.handleChange.bind(this)} />
                </div>
                <Link className="btn btn-primary ml-4" to="/overlays/0">
                  <i className="fa fa-plus"></i> {strings.NewOverlay}
                </Link>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <table className="table table-striped table-sm mt-5">
                  <thead>
                    <tr>
                      <th width="50px" className="text-center">{strings.NO}.</th>
                      <th>{strings.GroupName}</th>
                      <th>{strings.Element} {strings.Count}</th>
                      <th>{strings.CreatedAt}</th>
                      <th width="50px"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups}
                  </tbody>
                </table>
                <div className="text-center" style={{ marginTop: 40 }}>
                  <Pagination
                    activePage={this.state.pageIndex}
                    itemsCountPerPage={10}
                    totalItemsCount={this.state.totalCount}
                    pageRangeDisplayed={5}
                    onChange={this.handlePageChange.bind(this)}
                    prevPageText={strings.Prev}
                    nextPageText={strings.Next}
                    firstPageText={strings.First}
                    lastPageText={strings.Last}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

}