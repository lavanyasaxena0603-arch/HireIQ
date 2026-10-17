'use server';

import { supabaseAdmin } from '@/lib/supabase-server';
import { successResponse, errorResponse } from '@/lib/utils/response';

/**
 * Sign up a new candidate.
 */
export async function signUpCandidate(formData) {
  try {
    const email = formData.get('email');
    const password = formData.get('password');
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');

    if (!email || !password || !firstName || !lastName) {
      return errorResponse('Missing required fields');
    }

    if (!supabaseAdmin) {
      return errorResponse('Supabase environment not configured');
    }

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto confirm for demo purposes
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      },
    });

    if (authError) throw authError;

    // The database trigger will automatically create the public.users record.
    // 2. Create Candidate Profile
    const { error: profileError } = await supabaseAdmin
      .from('candidate_profiles')
      .insert({
        user_id: authData.user.id,
      });

    if (profileError) throw profileError;

    return successResponse({ userId: authData.user.id }, 'Candidate account created successfully');
  } catch (error) {
    console.error('Candidate Signup Error:', error);
    return errorResponse(error.message || 'Failed to create candidate account');
  }
}

/**
 * Sign up a new company.
 */
export async function signUpCompany(formData) {
  try {
    const email = formData.get('email');
    const password = formData.get('password');
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const companyName = formData.get('companyName');

    if (!email || !password || !firstName || !lastName || !companyName) {
      return errorResponse('Missing required fields');
    }

    if (!supabaseAdmin) {
      return errorResponse('Supabase environment not configured');
    }

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      },
    });

    if (authError) throw authError;

    // 2. Create Company
    const { data: companyData, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({
        name: companyName,
      })
      .select()
      .single();

    if (companyError) throw companyError;

    // 3. Link user to company as COMPANY_ADMIN
    const { error: memberError } = await supabaseAdmin
      .from('company_members')
      .insert({
        company_id: companyData.id,
        user_id: authData.user.id,
        role: 'COMPANY_ADMIN',
      });

    if (memberError) throw memberError;

    return successResponse({ userId: authData.user.id, companyId: companyData.id }, 'Company account created successfully');
  } catch (error) {
    console.error('Company Signup Error:', error);
    return errorResponse(error.message || 'Failed to create company account');
  }
}
