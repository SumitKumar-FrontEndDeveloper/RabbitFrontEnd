import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { Form, Button, Table } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Pagination from "./pagination";
import API from './api'
import moment from 'moment'
function App() {
  const [tab, setTab] = useState("short");

  return (
    <div className="App">
      <div className="tabs">
        <div
          className={`tab1 ${tab == "short" && "active"}`}
          onClick={() => setTab("short")}
        >
          Short Url
        </div>
        <div
          className={`tab2 ${tab == "list" && "active"}`}
          onClick={() => setTab("list")}
        >
          Admin Url List
        </div>
      </div>
      {tab == "short" ? <ShortUrlComponent /> : <ShortUrlList />}
    </div>
  );
}

const ShortUrlComponent = () => {
  const [expiryDate, setExpiryDate] = useState(() => {
    let date = new Date()
    date.setDate(date.getDate() + 1)
    return date;
  });
  const [longUrl, setLongUrl] = useState({
    url: "",
    urlError: false,
    response: null,
  });
  const [loading, setLoading] = useState(false);
  const validURL = (url) => {
    let pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    return !!pattern.test(url);
  };

  const changeUrl = (url) => {
    setLongUrl((prevState) => ({ ...longUrl, url, urlError: !validURL(url) }));
  };
  const submitForm = async () => {
   if (!validURL(longUrl.url)) { 
      setLongUrl((prevState) => {
        const arr = { ...prevState, urlError : true };
        return arr;
      });
      return;
    }
    setLoading(true);
    const urlData = { url: longUrl.url, expiryDate };
    API.post('/changeUrl' , {} , undefined , urlData).then((res) => {
      console.log("resres,", res)
      setLoading(false);
      setLongUrl((prevState) => ({ ...longUrl, response: res?.data }));
    }).catch((e)=> {
      setLoading(false);
      console.log("eeeee",e.response)
      if(e.response?.data){
          alert(e.response?.data?.msg+":: status code::"+e.response?.status)
      }
    }) ;
    
  };

  const openLongUrl = async (code) => {
    if (!code) return;
    setLoading(true);
    API.get("/getLongUrl?short_code=" + code).then((res) => {
      console.log("eeeee",res)
      setLoading(false);
      window.open(res.long_url, '_blank')

    }).catch((e)=> {
      setLoading(false);
      console.log("eeeee",e.response)
      if(e.response?.data){
          alert(e.response?.data?.msg+":: status code::"+e.response?.status)
      }
    }) ;
  };

  return (
    <>
      {loading && <div className="loader"></div>}
      {longUrl?.response && (
        <div className="responseHeader">
          <div className="label">
            <b>New Short Url</b>
          </div>
          <div className="shortValue">
            <a onClick={() => openLongUrl(longUrl?.response?.short_code)}>
              {longUrl?.response?.short_url}
            </a>
          </div>
        </div>
      )}
      <div className="row shortUrlBox">
        <div className="headerBox">
          <h4>Enter a long URL to make a shorten URL</h4>
        </div>
        <div className="textBox">
          <Form.Group controlId="exampleForm.ControlInput1">
            <Form.Control
              type="url"
              placeholder="Enter Url"
              value={longUrl.url}
              onChange={(e) => changeUrl(e.target.value)}
            />
          </Form.Group>
        </div>
        {longUrl.urlError && (
          <p className="error">Please enter valid long url.</p>
        )}
        <div className="customizeBox">
          <h4>Select Url Expiry Date</h4>
        </div>
        <div className="date-picker-box">
          <DatePicker
            selected={expiryDate}
            onChange={(date) => setExpiryDate(date)}
            dateFormat="dd-MM-yyyy"
            minDate={expiryDate}
          />
        </div>
        <div className="buttonBox">
          <Button type="submit" onClick={submitForm}>
            Make ShortURL!
          </Button>
        </div>
      </div>
    </>
  );
};

const ShortUrlList = () => {
  const [loading, setLoading] = useState(false);
  const [urlList, setUrlList] = useState(null);
  const [totalUrl, setTotalUrl] = useState(0);
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);

  const getUrlData = async () => {
    setLoading(true);
    const response = await API.get("/getUrlList?page=" + page);
    console.log("res", response)
    if(response?.status_code==200) {
      let totalPages = Math.floor(response?.data?.urlList?.total / 5) + 1;
      setTotalUrl(totalPages);
      setUrlList(response?.urlList?.data);
      setLoading(false);
    } else {
      setLoading(false);
      alert("something went wrong.");
    }
  };

  useEffect(() => {
    getUrlData();
  }, [page]);

  const deleteUrl = (id, index) => {
    if (!id) {
      alert("Id not denine!");
      return;
    }
    setLoading(true);
    const deletedata = { id };

    API.post('/deleteUrl' , {} , undefined , deletedata).then((res) => {
      setLoading(false);
        console.log("ddd",res)
        console.log(res?.data);
        setUrlList((prevState) => {
          const arr = [...prevState];
          arr.splice(index, 1);
          return arr;
        });
    }).catch((e)=> {
      setLoading(false);
      console.log("eeeee",e.response)
      if(e.response?.data){
          alert(e.response?.data?.msg+":: status code::"+e.response?.status)
      }
    }) ;
  };
  const nextPage = (page) => {
    console.log("page", page);
    setPage(page);
  };

  const checkUrl = (code) => {
    if (!code) return;
    setLoading(true);
    API.get("/getLongUrl?short_code=" + code).then((res) => {
      console.log("eeeee",res)
      setLoading(false);
      window.open(res.long_url, '_blank')

    }).catch((e)=> {
      setLoading(false);
      console.log("eeeee",e.response)
      if(e.response?.data){
          alert(e.response?.data?.msg+":: status code::"+e.response?.status)
      }
    });
  }

  return (
    <>
      {loading && <div className="loader"></div>}
      <div className="listBox">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Short URL/Code</th>
              <th>Long Url</th>
              <th>Hits</th>
              <th>Expiry Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {urlList &&
              urlList.map((val, key) => (
                <tr key={key}>
                  <td>
                    {page == 1 ? key + 1 : key + 1 + perPage * (page - 1)}
                  </td>
                  <td><a href="javascript:void(0)" onClick={() => checkUrl(val.short_code)}>http://www.rabbit.com/{val.short_code}</a></td>
                  <td>{val.long_url}</td>
                  <td>{val.hits}</td>
                  <td>{moment(val.expiry_date).format('DD-MM-YYYY')}</td>
                  <td>
                    <a
                      href="javascript:void(0)"
                      onClick={() => deleteUrl(val.id, key)}
                    >
                      Delete
                    </a>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
        <div>
          <Pagination
            totalPages={totalUrl}
            currentPage={page}
            nextPage={nextPage}
          />
        </div>
      </div>
    </>
  );
};

export default App;
