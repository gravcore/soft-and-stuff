import { useMutation } from '@tanstack/react-query';
import { forgotPassword, verifyResetOtp, resetPassword } from '../services/authApi';

export const useRequestOtp = () => useMutation({ mutationFn: forgotPassword });

export const useVerifyOtp = () => 
    useMutation({ mutationFn: (v: { email: string; otp: string; }) => verifyResetOtp(v.email, v.otp) });

export const useSetNewPassword = () => 
    useMutation({ mutationFn: (v: { email: string; newPassword: string; }) => resetPassword(v.email, v.newPassword) });