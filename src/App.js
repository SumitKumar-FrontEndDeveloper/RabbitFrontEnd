import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { Form, Button, Table } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Pagination from "./pagination";
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
    customUrl: "",
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
   if (!validURL(longUrl.url)) { console.log("ddfg")
      setLongUrl((prevState) => {
        const arr = { ...prevState, urlError : true };
        return arr;
      });
      return;
    }

    setLoading(true);
    const urlData = { url: longUrl.url, customUrl: longUrl.customUrl };
    axios
      .post("http://localhost:80/rabbit/public/api/v1/changeUrl", urlData)
      .then((response) => {
        setLoading(false);
        setLongUrl((prevState) => ({ ...longUrl, response: response?.data }));
        console.log(response?.data);
        return response;
      })
      .catch((e) => {
        setLoading(false);
        alert("something went wrong.");
        return e;
      });
  };

  const openLongUrl = (code) => {
    if (!code) return;
    setLoading(true);
    axios
      .get(
        "http://localhost:80/rabbit/public/api/v1/getLongUrl?short_code=" + code
      )
      .then((response) => {
        setLoading(false);
        console.log("response", response?.data);
        window.open(response?.data?.long_url, "_blank");
        return response;
      })
      .catch((e) => {
        setLoading(false);
        alert("something went wrong.");
        return e;
      });
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
        <div className="customizeBox">
          <h4>Customize your link</h4>
        </div>
        <div className="textBox">
          <Form.Control
            as="select"
            size="lg"
            value={longUrl.customUrl}
            onChange={(e) =>
              setLongUrl({ ...longUrl, customUrl: e.target.value })
            }
          >
            <option value="">Select Link</option>
            <option value="tinyurl.com">tinyurl.com</option>
            <option value="abc.com">abc.com</option>
            <option value="vidly.com">vidly.com</option>
          </Form.Control>
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

  const getUrlData = () => {
    setLoading(true);
    axios
      .get("http://localhost:80/rabbit/public/api/v1/getUrlList?page=" + page)
      .then((response) => {
        setLoading(false);
        console.log("response", response?.data);
        let totalPages = Math.floor(response?.data?.urlList?.total / 5) + 1;
        setTotalUrl(totalPages);
        setUrlList(response?.data?.urlList?.data);
        return response;
      })
      .catch((e) => {
        setLoading(false);
        alert("something went wrong.");
        return e;
      });
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
    axios
      .post("http://localhost:80/rabbit/public/api/v1/deleteUrl", deletedata)
      .then((response) => {
        setLoading(false);
        console.log(response?.data);
        setUrlList((prevState) => {
          const arr = [...prevState];
          arr.splice(index, 1);
          return arr;
        });

        return response;
      })
      .catch((e) => {
        setLoading(false);
        alert("something went wrong.");
        return e;
      });
  };
  const nextPage = (page) => {
    console.log("page", page);
    setPage(page);
  };

  return (
    <>
      {loading && <div className="loader"></div>}
      <div className="listBox">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Short Code</th>
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
                  <td>{val.short_code}</td>
                  <td>{val.long_url}</td>
                  <td>{val.hits}</td>
                  <td>{val.expiry_date}</td>
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
