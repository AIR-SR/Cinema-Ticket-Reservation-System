import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import BackButton from "../../components/BackButton";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import RegionSelector from "../../components/RegionSelector";

const PaymetListAdmin = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("krakow");
  const [regions] = useState(["krakow", "warsaw"]);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/payment/get-all", {
          params: { region: selectedRegion },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPayments(response.data);
      } catch (err) {
        setError("Failed to fetch payments.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [selectedRegion]);

  if (error)
    return (
      <div className="container mt-4">
        <h1 className="mb-4">Payment List</h1>
        <div className="d-flex align-items-center justify-content-between mb-3 gap-2">
          <RegionSelector
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            regions={regions}
            labelInline={true}
            fullWidth={false}
          />
        </div>
        <ErrorMessage
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Payment List</h1>
      <div className="d-flex align-items-center justify-content-between mb-3 gap-2">
        <RegionSelector
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          regions={regions}
          labelInline={true}
          fullWidth={false}
        />
      </div>
      {loading ? (
        <Loading message="Loading payment list..." />
      ) : payments.length > 0 ? (
        <table
          className="table table-striped"
          style={{ tableLayout: "fixed", width: "100%" }}
        >
          <thead>
            <tr>
              <th scope="col" style={{ width: "10%" }}>
                ID
              </th>
              <th scope="col" style={{ width: "15%" }}>
                Reservation ID
              </th>
              <th scope="col" style={{ width: "15%" }}>
                Amount
              </th>
              <th scope="col" style={{ width: "20%" }}>
                Payment Method
              </th>
              <th scope="col" style={{ width: "20%" }}>
                Date
              </th>
              <th scope="col" style={{ width: "20%" }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.id}</td>
                <td>{payment.reservation_id}</td>
                <td>{payment.amount}</td>
                <td>{payment.payment_method}</td>
                <td>
                  {payment.created_at
                    ? new Date(payment.created_at).toLocaleString()
                    : "N/A"}
                </td>
                <td>{payment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        // Enhanced empty state
        <div className="d-flex flex-column align-items-center justify-content-center text-center py-5">
          <div className="mb-3">
            <i
              className="bi bi-credit-card-x"
              style={{ fontSize: "3rem", color: "#6c757d" }}
            ></i>
          </div>
          <p className="mb-3 fs-5 text-muted">
            No payments found for the selected region.
          </p>
        </div>
      )}
      <div className="d-flex justify-content-start mt-4">
        <BackButton />
      </div>
    </div>
  );
};

export default PaymetListAdmin;
