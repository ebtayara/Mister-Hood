import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { get1dayData, graphTimePeriodButton, sellSharesButton } from '../store/stocks';
import { getDashboardData } from '../store/dashboard'
import ticks from "../data/1dayticks"
import './styles/Stocks.css';

// console.log(ticks);
// console.log(new Date());
// console.log(new Date(`${moment().format('YYYY-MM-DD')} 09:30:00`).getTime() / 1000)
// console.log(new Date("2021-07-22 13:50:00").getTime() / 1000);
// console.log((new Date('2021-07-13 09:30:00').getTime() / 1000) - 25200)// 9 30 =  1626168600
// console.log((new Date('2021-07-13 16:00:00').getTime() / 1000) - 25200) // needs to equal 1626969600
// console.log(moment().format('YYYY-MM-DD'))
// console.log(typeof(moment().format('YYYY-MM-DD')));


const Stocks = () => {
    const dispatch = useDispatch()
    const urlTicker = useParams().ticker

    const urlString = window.location.href;

    const getTicker = (string) => {
        for (let i = string.length; i >= 0; i--) {
            const slash = '/'
            if (string[i] === slash) {
                return string.substring(i + 1)
            }
        }
    }

    const [stockdata, setstockdata] = useState(null);
    const [totalStocks, setTotalStocks] = useState(1);
    const [sellShares, setSellShares] = useState(1);
    const [ticker, setTicker] = useState(getTicker(urlString))
    const [userId, setUserId] = useState(null)
    const [option, setOption] = useState('add')
    const priceData = useSelector(state => state?.priceData?.oneDayDataStocks)
    const user = useSelector(state => state.session.user);
    const oneDayGraphData = useSelector(state => state?.priceData?.oneDayDataStocks)
    const companyInfo = useSelector(state => state?.dashboard?.userData)
    const id = useParams();
    const oneDayGraphDataTrimmed = (data) => {
        const result = []
        for (let i = 0; i < data.length; i++) {
            if (data[i].date > ((new Date(`${moment().format('YYYY-MM-DD')} 09:30:00`).getTime() / 1000) - 25200)) {
                result.push(data[i])
            }
        }
        return result.reverse()
    }


    useEffect(() => {
        (async function fetchData() {
            const response = await fetch(`/api/stocks/info/${id.ticker}`);
            const responseData = await response.json();
            setstockdata(responseData);
            setUserId(user.id)
            dispatch(getDashboardData(user.id))
        })()

        dispatch(get1dayData(ticker))
    }, [user, id, dispatch]);

    const optionSetter = async () => {

    }


    const timePeriodButton = (payload_obj) => {
        dispatch(graphTimePeriodButton(payload_obj))
    }

    const min = (data) => {
        let min = Infinity;
        for (let i = 0; i < data.length; i++) {
            let lowData = data[i].low
            if (lowData < min) {
                min = lowData;
            };
        }
        return parseFloat((min * 0.995).toFixed(2));
    };

    const max = (data) => {
        let max = 0;
        for (let i = 0; i < data.length; i++) {
            let highData = data[i].high;
            if (highData > max) {
                max = highData;
            };
        };
        return parseFloat((max * 1.005).toFixed(2));
    };

    const formatXAxis = (tickItem) => {
        const milli = tickItem * 1000;
        return new Date(milli).toString();
    };


    if (!oneDayGraphData) {
        return (
            <div class="loader">
                <div class="inner one"></div>
                <div class="inner two"></div>
                <div class="inner three"></div>
            </div>
        )
    }

    const addToWatchlist = async (e) => {
        e.preventDefault();
        const response = await fetch(`/api/stocks/watchlist/${id.ticker}`);
        const responseData = await response.json();
        const company_id = responseData.Company_Info.id
        const user_id = user.id
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ option, company_id, user_id, ticker, })
        };
        const post = await fetch('/api/stocks/watchlist/options', requestOptions);
        const data = await post.json();
        console.log(data)
        // this.setState({ postId: data.id });
    };

    const findCompanyShare = (array) => {
        const shares = array.filter(ele => {
            if(ele.ticker === urlTicker) {
                console.log(ele.quantity)
                return ele.quantity
            }
            return 'No Shares Owned'
        })
        return shares
    };

    return (
        <div className='stocks-background'>
            <div className='stocks-info-container'>
                <div className='stock-details'>
                    <h2 className='stock-title'>{stockdata?.companyName}</h2>
                    <h2 className='stock-price'>${(stockdata?.latestPrice.toFixed(2))}</h2>
                    <h2 className='stock-change'> $ {(stockdata?.change.toFixed(2))} ({(stockdata?.changePercent.toFixed(2))}%) Change Today</h2>
                </div>
                <div className='side-bar-content'>
                    <div className='actions-container'>
                        <form className='buy-form'>
                            <label className='form-title'> Buy {stockdata?.symbol} :</label>
                            <div className='form-shares'>
                                <label className='form-item'>Shares: </label>
                                <input className='form-shares-input' placeholder={1}
                                    onChange={(e) => setTotalStocks(e.target.value)}
                                    value={totalStocks}
                                ></input>
                            </div>
                            <div className='form-market-price'>
                                <label className='form-item'>Market Price :</label>
                                <h1 className='market-price'>{(stockdata?.latestPrice.toFixed(2))}</h1>
                            </div>
                            <div className='est-cost-container'>
                                <label className='form-item'>Estimated Cost:</label>
                                <h1 className='total-price'>${totalStocks * (stockdata?.latestPrice.toFixed(2))}</h1>
                            </div>
                            <div className='buy-btn-container'>
                                <button className='buy-btn'>Buy</button>
                            </div>
                        </form>
                        <div className='buying-power-container'>
                            <h2>${user?.buying_power} buying power available</h2>
                        </div>
                    </div>
                    <div className='sellDiv'>
                    <form className='buy-form'>
                        <label className='form-title'> Sell {stockdata?.symbol} :</label>
                        <div className='form-shares'>
                            <label className='form-item'>Shares: </label>
                            <input className='form-shares-input' placeholder={1}
                                onChange={(e) => setSellShares(e.target.value)}
                                value={sellShares}
                            ></input>
                        </div>
                        <div className='form-market-price'>
                            <label className='form-item'>Market Price :</label>
                            <h1 className='market-price'>{(stockdata?.latestPrice.toFixed(2))}</h1>
                        </div>
                        <div className='est-cost-container'>
                            <label className='form-item'>Estimated value:</label>
                            <h1 className='total-price'>${sellShares * (stockdata?.latestPrice.toFixed(2))}</h1>
                        </div>
                        <div className='buy-btn-container'>
                            <button className='buy-btn' onClick={() => dispatch(sellSharesButton({'shares': sellShares, 'id': user.id, 'ticker': urlTicker}))}>Sell</button>
                        </div>
                        <div className='buying-power-container'>
                            {/* <h2>{companyInfo && findCompanyShare(companyInfo[0].portfolio)}</h2> */}
                        </div>
                    </form>
                </div>
                </div>
                <div className='company-graph'>
                    <div>
                        <ResponsiveContainer width="100%" aspect={2}>
                            <LineChart data={oneDayGraphData && oneDayGraphDataTrimmed(oneDayGraphData[0]?.oneDay[0])}>
                                <Line dataKey="close" stroke="#6afa27"
                                    strokeWidth={2} dot={false} isAnimationActive={false} />
                                <XAxis hide={false}
                                dataKey="date"
                                domain={[
                                    ((new Date(`${moment().format('YYYY-MM-DD')} 09:30:00`).getTime() / 1000) - 25200),
                                    ((new Date(`${moment().format('YYYY-MM-DD')} 16:00:00`).getTime() / 1000) - 25200)]}
                                    tickFormatter={formatXAxis}
                                />
                                <YAxis hide={false} domain={[min(oneDayGraphDataTrimmed(oneDayGraphData[0]?.oneDay[0])),
                                max(oneDayGraphDataTrimmed(oneDayGraphData[0]?.oneDay[0]))]} />
                                <Tooltip />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <button className='time-btn' onClick={() => timePeriodButton({'string': 'oneDay', 'ticker': urlTicker})}>1D</button>
                    <button className='time-btn' onClick={() => timePeriodButton({'string': 'oneWeek', 'ticker': urlTicker})}>1W</button>
                    <button className='time-btn' onClick={() => timePeriodButton({'string': 'oneMonth', 'ticker': urlTicker})}>1M</button>
                    <button className='time-btn' onClick={() => timePeriodButton({'string': 'threeMonths', 'ticker': urlTicker})}>3M</button>
                    <button className='time-btn' onClick={() => timePeriodButton({'string': 'oneYear', 'ticker': urlTicker})}>1Y</button>
                    <button className='time-btn' onClick={() => timePeriodButton({'string': 'fiveYears', 'ticker': urlTicker})}>5Y</button>
                </div>
                <div className='watchlist-container'>
                    <button className='watchlist-btn' onClick={addToWatchlist}>Watch {stockdata?.symbol}</button>
                </div>
            </div>
        </div>
    )
}


export default Stocks;
