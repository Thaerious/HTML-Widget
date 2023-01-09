import Express from "express";
import { buildTemplates } from "@html-widget/core";
const router = Express.Router();

router.use("/${camel}$", (req, res, next) => {
    const data = {
        buildTemplates: () => buildTemplates(${camel})
    }

    res.render("${camel}/${camel}.ejs", data, (err, html) => {
        if (err) throw new Error(err); 
        else res.send(html);
    });
});

export default router;