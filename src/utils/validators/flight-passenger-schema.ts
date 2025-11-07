import { differenceInYears } from "date-fns";
import * as Yup from "yup";

export const flightPssengerShema = Yup.object().shape({
  personInfo: Yup.array().of(
    Yup.object().shape({
      id: Yup.string().required(),
      type: Yup.string().required(),
      Title: Yup.string().required("Title is required"),
      Gender: Yup.string().required("Gender is required"),
      FirstName: Yup.string().required("First name is required"),
      LastName: Yup.string().required("Last name is required"),
      DateOfBirth: Yup.string()
        .required("DOB is required")
        .test(
          "is-adult",
          "Adult age should be greater than 12 years.",
          function (value) {
            const { type } = this.parent;
            if (type === "adult" && value) {
              return differenceInYears(new Date(), new Date(value)) > 12;
            }
            return true;
          }
        ),
      // passportNumber: Yup.string(),
      passportNumber: Yup.string().when(
        ["$isPassportRequiredAtBook", "$isPassportRequiredAtTicket"],
        {
          is: (book: boolean, ticket: boolean) => book || ticket,
          then: (schema) => schema.required("Passport number is required"),
          otherwise: (schema) => schema.notRequired(),
        }
      ),
      flyerMembership: Yup.string(),
      needsAssistance: Yup.boolean(),
    })
  ),
  contactInfo: Yup.object().shape({
    region: Yup.string().required("Region is required"),
    phoneNo: Yup.string().required("Phone is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
  }),
  wantOffer: Yup.boolean().required(),
});
