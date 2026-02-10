'use client'
import { useEffect, useRef, useState } from "react";
import { FormControl, Select, MenuItem, TextField, Button, CircularProgress, Chip, Box, Typography, Paper, Divider } from "@mui/material";
import styles from './ApiPlayground.module.css'

const MIN_TIMEOUT = 1;
const MAX_TIMEOUT = 15;

enum HttpMethods {
  POST = 'POST',
  PUT = 'PUT',
  GET = 'GET',
  DELETE = 'DELETE'
}

enum RequestStatus {
  IDLE = "idle",
  SENDING = "sending",
  WAITING = "waiting",
  SUCCESS = "success",
  ERROR = "error"
}

interface Result {
  status: number | null;
  statusText?: string | null;
  body: string | null;
  errorMessage?: string;
  executionTime?: number
}

const InitialResultState = {
  status: null,
  statusText: null,
  body: null,
  timeMs: 0,
  error: undefined,
}

export default function ApiPlayground() {
  const [method, setMethod] = useState<HttpMethods>(HttpMethods.GET);
  const [url, setUrl] = useState<string>('')
  const [urlError, setUrlError] = useState<string>('')
  const [timeoutError, setTimeoutError] = useState<string>('')
  const [requestBody, setRequestBody] = useState<string>('')

  const [status, setStatus] = useState<RequestStatus>(RequestStatus.IDLE)
  const [result, setResult] = useState<Result>(InitialResultState)

  const [timeoutValue, setTimeoutValue] = useState<number | ''>('');
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    setStatus(RequestStatus.IDLE);
    setRequestBody('')
  }, [url, method]);

  useEffect(() => {
    setUrlError('');
  }, [url]);

  useEffect(() => {
    setTimeoutError('');
  }, [timeoutValue]);

  const getStatus = () => {
    switch (status) {
      case RequestStatus.SENDING:
        return <CircularProgress />
      case RequestStatus.WAITING:
        return <div className={styles.waitingStatus}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: "primary.main",
              animation: "pulse 1s infinite",
              "@keyframes pulse": {
                "0%": { transform: "scale(1)", opacity: 0.6 },
                "50%": { transform: "scale(1.4)", opacity: 1 },
                "100%": { transform: "scale(1)", opacity: 0.6 },
              },
            }}
          />
          <div>Waiting for response...</div></div>
      case RequestStatus.ERROR:
        return <Chip label="Error" color={status} variant="filled" />
      case RequestStatus.SUCCESS:
        return <Chip label="Success" color={status} variant="filled" />
      default: return;
    }
  }

  const handleSubmit = async () => {
    const urlValidationError = validateUrl()
    setUrlError(urlValidationError);

    const timeoutValidationError = !!timeoutValue && (timeoutValue < MIN_TIMEOUT || timeoutValue > MAX_TIMEOUT) ?
      `Timeout value must be between ${MIN_TIMEOUT} and ${MAX_TIMEOUT}` :
      '';
    setTimeoutError(timeoutValidationError);

    if (urlValidationError || timeoutValidationError) {
      return;
    }

    setResult(InitialResultState);
    const controller = new AbortController();
    abortController.current = controller;

    const options: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
      ...((method === HttpMethods.POST || method === HttpMethods.PUT) && { body: requestBody }),
      signal: controller.signal
    }

    const startTime = performance.now();
    setStatus(RequestStatus.SENDING);

    if (timeoutValue) {
      setTimeout(() => controller.abort(), timeoutValue * 1000);
    }

    await new Promise(r => setTimeout(r, 200));

    try {
      const fetchPromise = fetch(url, options);
      setStatus(RequestStatus.WAITING);

      const res = await fetchPromise;
      const responseBody = await res.json().catch(() => null);

      const executionTime = performance.now() - startTime;

      if (!res.ok) {
        setStatus(RequestStatus.ERROR);
        setResult({
          status: res.status,
          body: responseBody,
          executionTime,
          errorMessage: res.statusText,
        });
        return;
      }

      setStatus(RequestStatus.SUCCESS);
      setResult({
        status: res.status,
        statusText: res.statusText,
        executionTime,
        body: responseBody,
      });

    } catch (error: any) {
      const executionTime = performance.now() - startTime;
      setStatus(RequestStatus.ERROR)
      setResult({
        status: null,
        statusText: null,
        body: null,
        executionTime,
        errorMessage: error.name === "AbortError" ? "Request cancelled/timeout" : error.message,
      });
    }
  }

  const cancelRequest = () => {
    abortController.current?.abort();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelRequest();
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [cancelRequest]);

  const validateUrl = () => {
    if (!url.trim()) {
      return 'URL is required!'
    }

    const validationRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i
    if (!url.match(validationRegex)) {
      return 'URL is in invalid format!'
    }

    return '';
  };

  const handleTimeoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setTimeoutValue(v === "" ? "" : Number(v));
  }

  return (
    <div className={styles.formWrapper}>
      <FormControl>
        <div className={styles.urlInput}>
          <Select
            size='small'
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className={styles.selectMethod}
          >
            {
              Object.values(HttpMethods).map(val => {
                return <MenuItem value={val}>{val}</MenuItem>
              })
            }

          </Select>
          <TextField
            label="URL"
            size='small'
            className={styles.url}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            error={!!urlError}
            helperText={urlError}
          />
          <Button
            size='small'
            disabled={status === RequestStatus.SENDING || status === RequestStatus.WAITING}
            className={styles.submitButton}
            variant='contained'
            onClick={() => handleSubmit()}
          >
            Submit
          </Button>
          <TextField
            size="small"
            label="Timeout"
            className={styles.timeout}
            value={timeoutValue}
            onChange={handleTimeoutChange}
            type="number"
            error={!!timeoutError}
            helperText={timeoutError}
            slotProps={{
              htmlInput: {
                min: MIN_TIMEOUT,
                max: MAX_TIMEOUT
              }
            }}
          />
        </div>
        {
          (method === HttpMethods.POST || method === HttpMethods.PUT) &&
          <TextField
            multiline
            className={styles.body}
            rows={10}
            value={requestBody}
            onChange={(event) => setRequestBody(event.target.value)}
          />
        }
      </FormControl>
      {status !== RequestStatus.IDLE && <Paper elevation={1} className={styles.resultContainer}>
        <div className={styles.header}>
          <div className={styles.status}>
            {getStatus()}
            {
              (status === RequestStatus.SENDING || status === RequestStatus.WAITING) &&
              <Button
                size='small'
                variant='outlined'
                onClick={() => cancelRequest()}
              >
                Cancel
              </Button>
            }
            {result?.status && <p>Status: {result.status} {result.statusText}</p>}
            {result?.errorMessage && <p>{result.errorMessage}</p>}
          </div>
          {result?.executionTime && <div>Execution time: {result.executionTime.toFixed()} ms</div>}
        </div>
        {
          result?.body &&
          <div className={styles.resultBody}>
            <Divider />
            <pre>
              <Typography fontFamily="monospace">
                {JSON.stringify(result.body, null, 2)}
              </Typography>
            </pre>
          </div>
        }
      </Paper>
      }
    </div>
  );
}
