import { toast } from 'react-hot-toast';

type ResponseType = {
  success: boolean;
  data: any;
  message: string | null;
};

/**
 * Unified API response handler for showing toast notifications.
 */
export function handleApiResponse(
  response: ResponseType,
  onSuccess?: (data: any) => void,
  onError?: (message: string) => void
) {
  if (response.success) {
    if (response.message) toast.success(response.message);
    if (onSuccess) onSuccess(response.data);
  } else {
    const errorMessage = response.message || "Something went wrong";
    toast.error(errorMessage);
    if (onError) onError(errorMessage);
  }
}
