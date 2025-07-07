<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'session_id' => 'required|uuid|exists:guest_sessions,session_id',
            'message' => 'required|string|max:1000',
            'attachments' => 'nullable|array|max:5',
            'attachments.*' => 'file|mimes:jpg,jpeg,png,pdf,doc,docx|max:10240', // 10MB
        ];
    }

    public function messages(): array
    {
        return [
            'session_id.required' => 'Session ID is required',
            'session_id.exists' => 'Invalid session',
            'message.required' => 'Message content is required',
            'message.max' => 'Message cannot exceed 1000 characters',
            'attachments.max' => 'Maximum 5 attachments allowed',
            'attachments.*.max' => 'File size cannot exceed 10MB',
        ];
    }
}
