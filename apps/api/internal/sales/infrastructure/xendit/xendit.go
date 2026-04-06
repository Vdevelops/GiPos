package xendit

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// XenditClient handles Xendit API integration
type XenditClient struct {
	apiKey     string
	baseURL    string
	httpClient *http.Client
}

// NewXenditClient creates a new Xendit client
func NewXenditClient(apiKey string) *XenditClient {
	return &XenditClient{
		apiKey:  apiKey,
		baseURL: "https://api.xendit.co",
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// CreateQRISPayment creates a QRIS payment
type CreateQRISPaymentRequest struct {
	ReferenceID    string `json:"reference_id"`
	Currency       string `json:"currency"`
	Amount         int64  `json:"amount"`
	QRCodeType     string `json:"qr_code_type,omitempty"` // DYNAMIC or STATIC
	CallbackURL    string `json:"callback_url,omitempty"`
	ExpirationDate string `json:"expiration_date,omitempty"`
}

// CreateQRISPaymentResponse represents QRIS payment response
type CreateQRISPaymentResponse struct {
	ID             string `json:"id"`
	ReferenceID    string `json:"reference_id"`
	QRString       string `json:"qr_string"`
	Status         string `json:"status"`
	Amount         int64  `json:"amount"`
	Currency       string `json:"currency"`
	CreatedAt      string `json:"created_at"`
	UpdatedAt      string `json:"updated_at"`
	ExpirationDate string `json:"expiration_date,omitempty"`
}

// CreateQRISPayment creates a QRIS payment
func (c *XenditClient) CreateQRISPayment(req *CreateQRISPaymentRequest) (*CreateQRISPaymentResponse, error) {
	url := fmt.Sprintf("%s/qr_codes", c.baseURL)

	reqBody, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("POST", url, bytes.NewBuffer(reqBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", fmt.Sprintf("Basic %s", c.apiKey))

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("xendit API error: %s", string(body))
	}

	var qrisResp CreateQRISPaymentResponse
	if err := json.Unmarshal(body, &qrisResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &qrisResp, nil
}

// GetQRISPaymentStatus gets QRIS payment status
func (c *XenditClient) GetQRISPaymentStatus(qrisID string) (*CreateQRISPaymentResponse, error) {
	url := fmt.Sprintf("%s/qr_codes/%s", c.baseURL, qrisID)

	httpReq, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Authorization", fmt.Sprintf("Basic %s", c.apiKey))

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("xendit API error: %s", string(body))
	}

	var qrisResp CreateQRISPaymentResponse
	if err := json.Unmarshal(body, &qrisResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &qrisResp, nil
}

// CreateEWalletPayment creates an e-wallet payment
type CreateEWalletPaymentRequest struct {
	ReferenceID    string            `json:"reference_id"`
	Currency       string            `json:"currency"`
	Amount         int64             `json:"amount"`
	CheckoutMethod string            `json:"checkout_method"` // ONE_TIME_PAYMENT
	ChannelCode    string            `json:"channel_code"`    // ID_OVO, ID_DANA, ID_LINKAJA, ID_SHOPEEPAY, ID_GOJEK
	ChannelProperties map[string]interface{} `json:"channel_properties,omitempty"`
	CallbackURL    string            `json:"callback_url,omitempty"`
}

// CreateEWalletPaymentResponse represents e-wallet payment response
type CreateEWalletPaymentResponse struct {
	ID             string `json:"id"`
	ReferenceID    string `json:"reference_id"`
	Status         string `json:"status"`
	Amount         int64  `json:"amount"`
	Currency       string `json:"currency"`
	ChannelCode    string `json:"channel_code"`
	Action         *struct {
		URL    string `json:"url,omitempty"`
		Method string `json:"method,omitempty"`
	} `json:"action,omitempty"`
	CreatedAt      string `json:"created_at"`
	UpdatedAt      string `json:"updated_at"`
}

// CreateEWalletPayment creates an e-wallet payment
func (c *XenditClient) CreateEWalletPayment(req *CreateEWalletPaymentRequest) (*CreateEWalletPaymentResponse, error) {
	url := fmt.Sprintf("%s/ewallets/charges", c.baseURL)

	reqBody, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("POST", url, bytes.NewBuffer(reqBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", fmt.Sprintf("Basic %s", c.apiKey))

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("xendit API error: %s", string(body))
	}

	var ewalletResp CreateEWalletPaymentResponse
	if err := json.Unmarshal(body, &ewalletResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &ewalletResp, nil
}

// GetEWalletPaymentStatus gets e-wallet payment status
func (c *XenditClient) GetEWalletPaymentStatus(chargeID string) (*CreateEWalletPaymentResponse, error) {
	url := fmt.Sprintf("%s/ewallets/charges/%s", c.baseURL, chargeID)

	httpReq, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Authorization", fmt.Sprintf("Basic %s", c.apiKey))

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("xendit API error: %s", string(body))
	}

	var ewalletResp CreateEWalletPaymentResponse
	if err := json.Unmarshal(body, &ewalletResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &ewalletResp, nil
}
