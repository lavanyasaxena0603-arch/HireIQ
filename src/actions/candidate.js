"use server";

import { createClient } from '@supabase/supabase-js';

// Server-side helper to get authenticated user and client
async function getAuthClient(token) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: { headers: { Authorization: `Bearer ${token}` } }
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");
  return { supabase, user };
}

/**
 * Submit a job application.
 * jobId is now optional — allows submitting without a real job (general profile).
 */
export async function submitApplication(jobId, formData, token) {
  try {
    const { supabase, user } = await getAuthClient(token);

    // Insert application — job_id may be null for open applications
    const insertPayload = {
      candidate_id: user.id,
      status: 'Applied',
      notes: JSON.stringify(formData),
    };

    // Only add job_id if it's a real UUID (not null or dummy)
    if (jobId && jobId !== '00000000-0000-0000-0000-000000000000') {
      insertPayload.job_id = jobId;
    }

    const { data, error } = await supabase
      .from('applications')
      .insert([insertPayload])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("submitApplication error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Save resume text and full canonical analysis JSON to the resumes table.
 * FIXED: removed the invalid skills column update on candidate_profiles.
 * The canonical JSON already contains structured skills in parsed_data.
 */
export async function saveResumeAnalysis(resumeText, analysisJson, token, fileName = null) {
  try {
    const { supabase, user } = await getAuthClient(token);

    // Prepare the resume record
    const resumePayload = {
      candidate_id: user.id,
      raw_text: resumeText,
      parsed_data: analysisJson,
    };

    // Add optional file metadata if available
    if (fileName) {
      resumePayload.file_name = fileName;
    }

    const { data: resumeData, error: resumeError } = await supabase
      .from('resumes')
      .insert([resumePayload])
      .select();

    if (resumeError) throw resumeError;

    // Attempt to update candidate_profile from parsed contact info
    // Uses only columns that actually exist in the schema
    const contact = analysisJson?.candidate;
    if (contact) {
      const profileUpdate = {};
      if (contact.location) profileUpdate.location = contact.location;
      if (contact.phone) profileUpdate.phone = contact.phone;
      if (analysisJson?.summary) profileUpdate.about = analysisJson.summary;

      if (Object.keys(profileUpdate).length > 0) {
        await supabase
          .from('candidate_profiles')
          .update(profileUpdate)
          .eq('user_id', user.id);
        // Silently ignore errors here — profile may not exist yet
      }
    }

    return { success: true, data: resumeData };
  } catch (err) {
    console.error("saveResumeAnalysis error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch a candidate's own applications.
 */
export async function fetchMyApplications(token) {
  try {
    const { supabase, user } = await getAuthClient(token);

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('candidate_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("fetchMyApplications error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch a candidate's own resumes (all analysis history).
 */
export async function fetchMyResumes(token) {
  try {
    const { supabase, user } = await getAuthClient(token);

    const { data, error } = await supabase
      .from('resumes')
      .select('id, created_at, file_name, parsed_data')
      .eq('candidate_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("fetchMyResumes error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch a single resume by ID (must belong to the authenticated user).
 */
export async function fetchResumeById(resumeId, token) {
  try {
    const { supabase, user } = await getAuthClient(token);

    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('candidate_id', user.id)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("fetchResumeById error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch a candidate's own profile.
 */
export async function fetchMyProfile(token) {
  try {
    const { supabase, user } = await getAuthClient(token);

    const { data, error } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return { success: true, data: data || null };
  } catch (err) {
    console.error("fetchMyProfile error:", err);
    return { success: false, error: err.message };
  }
}
