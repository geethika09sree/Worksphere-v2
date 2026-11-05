
import { apiSlice } from "./apiSlice";

export const workforceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ================= EMPLOYEES =================
    getEmployees: builder.query({
      query: () => "/employees",
      providesTags: ["Employee"],
    }),

    getEmployeeById: builder.query({
      query: (id) => `/employees/${id}`,
      providesTags: ["Employee"],
    }),

    addEmployee: builder.mutation({
      query: (employee) => ({
        url: "/employees",
        method: "POST",
        body: employee,
      }),
      invalidatesTags: ["Employee"],
    }),

    updateEmployee: builder.mutation({
      query: ({ id, ...employee }) => ({
        url: `/employees/${id}`,
        method: "PUT",
        body: employee,
      }),
      invalidatesTags: ["Employee"],
    }),

    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `/employees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Employee"],
    }),

    // ================= SELF-SERVICE (logged-in employee) =================
    getMyEmployee: builder.query({
      query: () => "/employees/me",
      providesTags: ["Employee"],
    }),

    getMyPayroll: builder.query({
      query: () => "/payroll/my",
      providesTags: ["Payroll"],
    }),

    getMyPerformance: builder.query({
      query: () => "/performance/my",
      providesTags: ["Performance"],
    }),

    // ================= THIRD-PARTY: PUBLIC HOLIDAYS (via backend proxy) =================
    getHolidays: builder.query({
      query: ({ year, country = "IN" } = {}) => ({
        url: "/external/holidays",
        params: { ...(year ? { year } : {}), country },
      }),
      providesTags: ["Holiday"],
      keepUnusedDataFor: 86400,
    }),

    // ================= DEPARTMENTS =================
    getDepartments: builder.query({
      query: () => "/departments",
      providesTags: ["Department"],
    }),

    addDepartment: builder.mutation({
      query: (department) => ({
        url: "/departments",
        method: "POST",
        body: department,
      }),
      invalidatesTags: ["Department"],
    }),

    updateDepartment: builder.mutation({
      query: ({ id, ...department }) => ({
        url: `/departments/${id}`,
        method: "PUT",
        body: department,
      }),
      invalidatesTags: ["Department"],
    }),

    deleteDepartment: builder.mutation({
      query: (id) => ({
        url: `/departments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Department"],
    }),

    // ================= ATTENDANCE =================
    getAttendance: builder.query({
      query: () => "/attendance",
      providesTags: ["Attendance"],
    }),

    checkIn: builder.mutation({
      query: (data = {}) => ({
        url: "/attendance/checkin",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Attendance"],
    }),

    checkOut: builder.mutation({
      query: (data = {}) => ({
        url: "/attendance/checkout",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Attendance"],
    }),

    // ================= LEAVES =================
    getLeaves: builder.query({
      query: () => "/leaves",
      providesTags: ["Leave"],
    }),

    applyLeave: builder.mutation({
      query: (leave) => ({
        url: "/leaves",
        method: "POST",
        body: leave,
      }),
      invalidatesTags: ["Leave"],
    }),

    reviewLeave: builder.mutation({
      query: ({ id, status }) => ({
        url: `/leaves/${id}/review`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Leave"],
    }),

    // ================= PERFORMANCE =================
    getPerformance: builder.query({
      query: () => "/performance",
      providesTags: ["Performance"],
    }),

    addPerformance: builder.mutation({
      query: (record) => ({
        url: "/performance",
        method: "POST",
        body: record,
      }),
      invalidatesTags: ["Performance"],
    }),

    updatePerformance: builder.mutation({
      query: ({ id, ...record }) => ({
        url: `/performance/${id}`,
        method: "PUT",
        body: record,
      }),
      invalidatesTags: ["Performance"],
    }),

    deletePerformance: builder.mutation({
      query: (id) => ({
        url: `/performance/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Performance"],
    }),

    // ================= PAYROLL =================
    getPayroll: builder.query({
      query: () => "/payroll",
      providesTags: ["Payroll"],
    }),

    createPayroll: builder.mutation({
      query: (payroll) => ({
        url: "/payroll",
        method: "POST",
        body: payroll,
      }),
      invalidatesTags: ["Payroll"],
    }),

    updatePayrollStatus: builder.mutation({
      query: ({ id, status, paymentDate }) => ({
        url: `/payroll/${id}/status`,
        method: "PATCH",
        body: { status, paymentDate },
      }),
      invalidatesTags: ["Payroll"],
    }),

    // ================= FINANCE =================
    getFinance: builder.query({
      query: () => "/finance",
      providesTags: ["Finance"],
    }),

    addFinance: builder.mutation({
      query: (transaction) => ({
        url: "/finance",
        method: "POST",
        body: transaction,
      }),
      invalidatesTags: ["Finance"],
    }),

    updateFinance: builder.mutation({
      query: ({ id, ...transaction }) => ({
        url: `/finance/${id}`,
        method: "PUT",
        body: transaction,
      }),
      invalidatesTags: ["Finance"],
    }),

    deleteFinance: builder.mutation({
      query: (id) => ({
        url: `/finance/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Finance"],
    }),

  }),
});

export const {
  // Employees
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,

  // Self-service
  useGetMyEmployeeQuery,
  useGetMyPayrollQuery,
  useGetMyPerformanceQuery,

  // Third-party holidays
  useGetHolidaysQuery,

  // Departments
  useGetDepartmentsQuery,
  useAddDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,

  // Attendance
  useGetAttendanceQuery,
  useCheckInMutation,
  useCheckOutMutation,

  // Leaves
  useGetLeavesQuery,
  useApplyLeaveMutation,
  useReviewLeaveMutation,

  // Performance
  useGetPerformanceQuery,
  useAddPerformanceMutation,
  useUpdatePerformanceMutation,
  useDeletePerformanceMutation,

  // Payroll
  useGetPayrollQuery,
  useCreatePayrollMutation,
  useUpdatePayrollStatusMutation,

  // Finance
  useGetFinanceQuery,
  useAddFinanceMutation,
  useUpdateFinanceMutation,
  useDeleteFinanceMutation,

} = workforceApi;
